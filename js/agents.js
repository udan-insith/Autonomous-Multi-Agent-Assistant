class AgentPipeline {
  constructor() {
    this.listeners = [];
    this.tfidfIndex = new this.TfIdfIndex(CORUPS);
    this.evaluator = new EvaluatorAgent();
    this.synthesizer = new SynthesizerAgent();
    this.running = false;
  }

  on(callback) {
    this.listeners.push(callback);
  }

  emit(event) {
    for (const cb of this.listeners) cb(event);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async run(rawQuery) {
    if (this.running) return;
    this.running = true;

    this.emit({ type: "run-start", query: rawQuery });

    // STAGE !
    this.emit({
      type: "agent-status",
      agentId: "query-optimizer",
      status: "working",
      progress: 10,
      task: "Tokenizing query…",
    });
    await this.sleep(500);

    const opt = optimizeQuery(rwaQuery);
    this.emit({
      type: "log",
      agentId: "query-optimizer",
      level: "info",
      message: `Expanded query with ${opt.expansionTerms.length} related term(s): ${opt.expansionTerms.join(", ") || "(none found)"}`,
    });
    this.emit({
      type: "agent-status",
      agentId: "query-optimizer",
      status: "working",
      progress: 70,
      task: "Building optimized query…",
    });
    await this.sleep(600);

    this.emit({
      type: "log",
      agentId: "query-optimizer",
      level: "success",
      message: `Optimized query ready: "${opt.optimizedQuery}"`,
    });
    this.emit({
      type: "agent-status",
      agentId: "query-optimizer",
      status: "completed",
      progress: 100,
      task: "Done.",
    });
    await this.sleep(300);

    // STAGE 2
    this.emit({
      type: "agent-status",
      agentId: "paper-fetcher",
      status: "working",
      progress: 10,
      task: "Searching offline corpus (TF-IDF)…",
    });
    await this.sleep(500);

    const searchResults = this.tfidfIndex.search(opt.optimizedQuery, 12);
    this.emit({
      type: "log",
      agentId: "paper-fetcher",
      level: "info",
      message: `Scanned ${CORPUS.length} indexed papers…`,
    });
    await this.sleep(400);

    const angleStep = (2 * Math.PI) / Math.max(1, searchResults.length);
    for (let i = 0; i < searchResults.length; i++) {
      const r = searchResults[i];
      this.emit({
        type: "citation-node",
        node: {
          id: r.doc.id,
          label:
            r.doc.title.length > 28
              ? r.doc.title.slice(0, 26) + "…"
              : r.doc.title,
          x: 0.5 + 0.36 * Math.cos(i * angleStep),
          y: 0.5 + 0.36 * Math.sin(i * angleStep),
          weight: Math.round(r.score * 100),
        },
      });
      if (i > 0) {
        this.emit({
          type: "citation-edge",
          edge: { id: `e-${r.doc.id}`, target: r.doc.id },
        });
      }
      await this.sleep(90);
    }

    this.emit({
      type: "log",
      agentId: "paper-fetcher",
      level: "success",
      message: `Retrieved ${searchResults.length} candidate papers via TF-IDF cosine similarity.`,
    });
    this.emit({
      type: "agent-status",
      agentId: "paper-fetcher",
      status: "completed",
      progress: 100,
      task: "Done.",
    });
    await this.sleep(300);

    // STAGE 3
    this.emit({
      type: "agent-status",
      agentId: "evaluator",
      status: "working",
      progress: 10,
      task: "Training relevance-scoring network…",
    });
    await this.sleep(400);

    const history = this.evaluator.train(500);
    this.emit({
      type: "log",
      agentId: "evaluator",
      level: "info",
      message: `Trained feedforward NN: MSE ${history[0].toFixed(3)} → ${history[history.length - 1].toFixed(4)} over ${history.length} epochs.`,
    });
    this.emit({
      type: "agent-status",
      agentId: "evaluator",
      status: "working",
      progress: 50,
      task: "Scoring candidates…",
    });
    await this.sleep(500);

    const evaluated = this.evaluator.evaluate(
      searchResults,
      tokenize(opt.optimizedQuery),
    );
    evaluated.sort((a, b) => b.relevance - a.relevance);

    for (const e of evaluated.slice(0, 3)) {
      this.emit({
        type: "log",
        agentId: "evaluator",
        level: e.relevance > 0.5 ? "success" : "warning",
        message: `Vector distance matched at ${e.relevance.toFixed(2)} for "${e.doc.title}"`,
      });
      await this.sleep(220);
    }

    const passed = evaluated.filter((e) => e.relevance >= 0.3).length;
    this.emit({
      type: "log",
      agentId: "evaluator",
      level: "success",
      message: `${passed} papers passed relevance threshold (>0.30).`,
    });
    this.emit({
      type: "agent-status",
      agentId: "evaluator",
      status: "completed",
      progress: 100,
      task: "Done.",
    });
    await this.sleep(300);
  }
}

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
  }
}

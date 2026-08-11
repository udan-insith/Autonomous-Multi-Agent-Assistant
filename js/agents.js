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
  }
}

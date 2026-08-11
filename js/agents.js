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
}

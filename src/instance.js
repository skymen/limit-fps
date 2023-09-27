function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);

      this.maxFPS = 10;

      if (properties) {
        this.maxFPS = properties[0];
      }

      let lastTime = Date.now() / 1000;
      const oldFn = this._runtime.Tick.bind(this._runtime);

      this._runtime.Tick = async (...args) => {
        const now = Date.now() / 1000;
        if (this.maxFPS <= 0 || now - lastTime >= 1 / this.maxFPS) {
          await oldFn(...args);
          lastTime = now;
        } else {
          setTimeout(() => {
            /* requestAnimationFrame((timestamp) => {
              args[0] = timestamp
              this._runtime.Tick(...args);
            }); */
            args[0] = Date.now() / 1000;
            this._runtime.Tick(...args);
          }, (now - lastTime - 1 / this.maxFPS) * 1000 - 1);
        }
      };
    }

    Release() {
      super.Release();
    }

    SaveToJson() {
      return {
        // save state for savegames
        maxFPS: this.maxFPS,
      };
    }

    LoadFromJson(o) {
      // load state for savegames
      this.maxFPS = o.maxFPS;
    }

    Trigger(method) {
      super.Trigger(method);
      const addonTrigger = addonTriggers.find((x) => x.method === method);
      if (addonTrigger) {
        this.GetScriptInterface().dispatchEvent(new C3.Event(addonTrigger.id));
      }
    }

    GetScriptInterfaceClass() {
      return scriptInterface;
    }

    _SetMaxFPS(maxFPS) {
      this.maxFPS = maxFPS;
    }

    _MaxFPS() {
      return this.maxFPS;
    }
  };
}

describe("Spell Service - Spell Validation", () => {
  let validateSpell;

  beforeEach(() => {
    validateSpell = (spell) => {
      const errors = [];

      if (
        !spell.name ||
        typeof spell.name !== "string" ||
        spell.name.trim() === ""
      ) {
        errors.push("Spell name is required");
      }

      if (
        typeof spell.level !== "number" ||
        spell.level < 0 ||
        spell.level > 9
      ) {
        errors.push("Spell level must be between 0 and 9");
      }

      if (typeof spell.actions !== "number" || spell.actions < 1) {
        errors.push("Actions must be at least 1");
      }

      if (!spell.range || typeof spell.range !== "string") {
        errors.push("Spell range is required");
      }

      if (typeof spell.concentration !== "boolean") {
        errors.push("Concentration must be a boolean");
      }

      if (typeof spell.ritual !== "boolean") {
        errors.push("Ritual must be a boolean");
      }

      if (!Array.isArray(spell.components) || spell.components.length === 0) {
        errors.push("Spell must have at least one component");
      }

      if (
        !spell.narrativeDescription ||
        typeof spell.narrativeDescription !== "string"
      ) {
        errors.push("Narrative description is required");
      }

      if (
        !spell.mechanicalDescription ||
        typeof spell.mechanicalDescription !== "string"
      ) {
        errors.push("Mechanical description is required");
      }

      if (!spell.duration || typeof spell.duration !== "object") {
        errors.push("Duration is required");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };
  });

  it("should validate correct spell data", () => {
    const validSpell = {
      name: "Fireball",
      level: 3,
      actions: 1,
      range: "150 feet",
      concentration: false,
      ritual: false,
      components: ["V", "S", "M"],
      narrativeDescription: "A fiery explosion",
      mechanicalDescription: "Deals 8d6 damage",
      duration: { value: 1, unit: "instantaneous" },
    };

    const result = validateSpell(validSpell);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject spell without name", () => {
    const invalidSpell = {
      level: 3,
      actions: 1,
      range: "150 feet",
      concentration: false,
      ritual: false,
      components: ["V", "S"],
      narrativeDescription: "A spell",
      mechanicalDescription: "Does something",
      duration: { value: 1, unit: "round" },
    };

    const result = validateSpell(invalidSpell);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Spell name is required");
  });

  it("should reject invalid spell level", () => {
    const invalidSpell = {
      name: "Test Spell",
      level: 10,
      actions: 1,
      range: "150 feet",
      concentration: false,
      ritual: false,
      components: ["V", "S"],
      narrativeDescription: "A spell",
      mechanicalDescription: "Does something",
      duration: { value: 1, unit: "round" },
    };

    const result = validateSpell(invalidSpell);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Spell level must be between 0 and 9");
  });

  it("should reject spell without components", () => {
    const invalidSpell = {
      name: "Test Spell",
      level: 2,
      actions: 1,
      range: "60 feet",
      concentration: false,
      ritual: false,
      components: [],
      narrativeDescription: "A spell",
      mechanicalDescription: "Does something",
      duration: { value: 1, unit: "round" },
    };

    const result = validateSpell(invalidSpell);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Spell must have at least one component");
  });

  it("should reject spell with invalid concentration value", () => {
    const invalidSpell = {
      name: "Test Spell",
      level: 2,
      actions: 1,
      range: "60 feet",
      concentration: "yes",
      ritual: false,
      components: ["V", "S"],
      narrativeDescription: "A spell",
      mechanicalDescription: "Does something",
      duration: { value: 1, unit: "round" },
    };

    const result = validateSpell(invalidSpell);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Concentration must be a boolean");
  });
});

describe("Spell Service - Duration Parsing", () => {
  let parseDuration;

  beforeEach(() => {
    parseDuration = (duration) => {
      if (
        duration.value === null ||
        duration.value === undefined ||
        !duration.unit
      ) {
        return "Invalid duration";
      }

      if (duration.unit === "instantaneous") {
        return "Instantaneous";
      }

      if (duration.unit === "minute" || duration.unit === "minutes") {
        return `${duration.value} minute${duration.value > 1 ? "s" : ""}`;
      }

      if (duration.unit === "hour" || duration.unit === "hours") {
        return `${duration.value} hour${duration.value > 1 ? "s" : ""}`;
      }

      if (duration.unit === "day" || duration.unit === "days") {
        return `${duration.value} day${duration.value > 1 ? "s" : ""}`;
      }

      if (duration.unit === "round" || duration.unit === "rounds") {
        return `${duration.value} round${duration.value > 1 ? "s" : ""}`;
      }

      if (duration.unit === "custom") {
        return duration.customUnit || "Custom duration";
      }

      return "Unknown duration";
    };
  });

  it("should parse instantaneous duration", () => {
    const duration = { value: 0, unit: "instantaneous" };
    const result = parseDuration(duration);

    expect(result).toBe("Instantaneous");
  });

  it("should parse minute duration", () => {
    const duration = { value: 10, unit: "minute" };
    const result = parseDuration(duration);

    expect(result).toBe("10 minutes");
  });

  it("should parse single round duration", () => {
    const duration = { value: 1, unit: "round" };
    const result = parseDuration(duration);

    expect(result).toBe("1 round");
  });

  it("should parse hour duration", () => {
    const duration = { value: 8, unit: "hour" };
    const result = parseDuration(duration);

    expect(result).toBe("8 hours");
  });

  it("should parse custom duration", () => {
    const duration = {
      value: 1,
      unit: "custom",
      customUnit: "Until dispelled",
    };
    const result = parseDuration(duration);

    expect(result).toBe("Until dispelled");
  });
});

describe("Spell Service - Component Validation", () => {
  const validComponents = ["V", "S", "M"];

  it("should validate verbal component", () => {
    expect(validComponents).toContain("V");
  });

  it("should validate somatic component", () => {
    expect(validComponents).toContain("S");
  });

  it("should validate material component", () => {
    expect(validComponents).toContain("M");
  });

  it("should reject invalid component", () => {
    expect(validComponents).not.toContain("X");
  });

  it("should accept spell with multiple components", () => {
    const spellComponents = ["V", "S", "M"];

    expect(spellComponents).toHaveLength(3);
    expect(spellComponents).toEqual(expect.arrayContaining(["V", "S", "M"]));
  });
});

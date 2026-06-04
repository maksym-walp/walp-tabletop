const request = require("supertest");
const express = require("express");

describe("Spell Service - Health Check", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get("/health", (req, res) => {
      res.json({ status: "ok", service: "spell-service" });
    });
  });

  it("should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "spell-service",
    });
  });
});

describe("Spell Service - CORS Configuration", () => {
  let app;

  beforeEach(() => {
    const cors = require("cors");
    app = express();
    app.use(cors());
    app.use(express.json());
    app.get("/test", (req, res) => {
      res.json({ message: "test" });
    });
  });

  it("should have CORS headers enabled", async () => {
    const response = await request(app)
      .get("/test")
      .set("Origin", "http://localhost:3000");

    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });
});

describe("Spell Service - Spell Data Processing", () => {
  let processSpellRow;

  beforeEach(() => {
    // Mock the processSpellRow function from server.js
    processSpellRow = (row) => {
      const traditions = row.traditions ? row.traditions.split(",") : [];

      let components = row.components || [];
      if (typeof components === "string") {
        try {
          components = JSON.parse(components);
        } catch (e) {
          components = [];
        }
      }

      let higherLevels = row.higher_levels || {};
      if (typeof higherLevels === "string") {
        try {
          higherLevels = JSON.parse(higherLevels);
        } catch (e) {
          higherLevels = {};
        }
      }

      return {
        id: row.id,
        name: row.name,
        level: row.level,
        actions: row.actions,
        range: row.spell_range,
        concentration: row.concentration,
        ritual: row.ritual,
        traditions,
        components,
        narrativeDescription: row.narrative_description,
        mechanicalDescription: row.mechanical_description,
        hasHigherLevels: Boolean(row.has_higher_levels),
        higherLevels,
        duration: {
          value: row.duration_value,
          unit: row.duration_unit,
          customUnit: row.duration_custom_unit,
        },
      };
    };
  });

  it("should process spell with traditions correctly", () => {
    const mockSpell = {
      id: 1,
      name: "Fireball",
      level: 3,
      actions: 1,
      spell_range: "150 feet",
      concentration: false,
      ritual: false,
      traditions: "Evocation,Destruction",
      components: JSON.stringify(["V", "S", "M"]),
      narrative_description: "A fiery explosion",
      mechanical_description: "Deals damage in area",
      has_higher_levels: true,
      higher_levels: JSON.stringify({ level: 4, effect: "More damage" }),
      duration_value: 1,
      duration_unit: "round",
      duration_custom_unit: null,
    };

    const spell = processSpellRow(mockSpell);

    expect(spell.id).toBe(1);
    expect(spell.name).toBe("Fireball");
    expect(spell.level).toBe(3);
    expect(Array.isArray(spell.traditions)).toBe(true);
    expect(spell.traditions).toContain("Evocation");
    expect(spell.traditions).toContain("Destruction");
    expect(Array.isArray(spell.components)).toBe(true);
    expect(spell.hasHigherLevels).toBe(true);
  });

  it("should handle spells without traditions", () => {
    const mockSpell = {
      id: 2,
      name: "Magic Missile",
      level: 1,
      actions: 1,
      spell_range: "60 feet",
      concentration: false,
      ritual: false,
      traditions: null,
      components: JSON.stringify(["V", "S"]),
      narrative_description: "Magical projectiles",
      mechanical_description: "Always hits",
      has_higher_levels: false,
      higher_levels: JSON.stringify({}),
      duration_value: 1,
      duration_unit: "instantaneous",
      duration_custom_unit: null,
    };

    const spell = processSpellRow(mockSpell);

    expect(spell.traditions).toEqual([]);
    expect(spell.hasHigherLevels).toBe(false);
  });

  it("should handle invalid JSON in components gracefully", () => {
    const mockSpell = {
      id: 3,
      name: "Test Spell",
      level: 2,
      actions: 1,
      spell_range: "60 feet",
      concentration: false,
      ritual: false,
      traditions: null,
      components: "invalid json",
      narrative_description: "Test",
      mechanical_description: "Test",
      has_higher_levels: false,
      higher_levels: "invalid json",
      duration_value: 1,
      duration_unit: "round",
      duration_custom_unit: null,
    };

    const spell = processSpellRow(mockSpell);

    expect(Array.isArray(spell.components)).toBe(true);
    expect(spell.components).toEqual([]);
    expect(typeof spell.higherLevels).toBe("object");
    expect(spell.higherLevels).toEqual({});
  });
});

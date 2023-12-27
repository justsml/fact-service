import { describe, it, expect, bench } from "vitest";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "./app";
import { dbAdapter } from "./lib/config";

const request = supertest(app());
const authorization = "Bearer tahjisheiPaa9taem3oo";

describe.sequential(`Test: ${dbAdapter.toUpperCase()}`, () => {
  const users = Array(100).fill(null).map(createRandomUser);
  describe(`Batch Create ${dbAdapter}`, () => {
    bench(`Create batch: 100`, async () => {
      for await (const user of users) {
        const response = await request
          .post(`/api/facts/${user.key}`)
          .set("Content-Type", "application/json")
          .set("Authorization", authorization)
          .send(user);

        expect(response.status).toBe(201);
      }
    });
  });

  describe(`Batch Delete ${dbAdapter}`, () => {
    bench(`Remove batch: 100`, async () => {
      for await (const user of users) {
        const response = await request
          .delete(`/api/facts/${user.key}`)
          .set("Authorization", authorization);

        expect(response.status).toBe(204);
      }
    });
  });

  describe.skip(`API Tests ${dbAdapter}`, () => {
    it("PUT /api/facts/user/456", async () => {
      const response = await request
        .put("/api/facts/user/456")
        .set("Content-Type", "application/json")
        .set("Authorization", authorization)
        .send({
          path: "user",
          key: "456",
          value: '{"json": true}',
        });

      expect(response.status).toBe(201);
      // Additional assertions
    });

    it("POST /api/facts/user/123", async () => {
      const response = await request
        .post("/api/facts/user/123")
        .set("Content-Type", "application/json")
        .set("Authorization", authorization)
        .send({
          note: "posted!",
          value: '{"json": true, "updated": "🚀"}',
        });

      expect(response.status).toBe(201);
      // Additional assertions
    });

    it("DELETE /api/facts/user/123", async () => {
      const response = await request
        .delete("/api/facts/user/123")
        .set("Authorization", authorization);

      expect(response.status).toBe(204);
      // Additional assertions
    });

    it("GET /api/facts/ with keyPrefix=user", async () => {
      const response = await request
        .get("/api/facts/?keyPrefix=user")
        .set("Accept", "*/*")
        .set("Accept-Language", "en-US,en;q=0.9")
        .set("Authorization", authorization)
        .send();

      expect(response.status).toBe(200);
      // Additional assertions
    });
  });
});

function createRandomUser() {
  return {
    _id: faker.string.uuid(),
    key: `user/${faker.number.int({ min: 100, max: 99999999 })}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    birthday: faker.date.birthdate(),
    subscriptionTier: faker.helpers.arrayElement(["free", "basic", "business"]),
    bio: faker.lorem.paragraph({ min: 1, max: 3 }),
  };
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "./app";
import { faker } from "@faker-js/faker";
import { config, AvailableAdapters, type DbAdapter } from "@/config";
import { omit } from "lodash";
import { logger } from "@/common/logger";

let testAdapters = [...AvailableAdapters]; 

if (config.testAdapters) {
  testAdapters = config.testAdapters as DbAdapter[];
}

const getHeaders = () => ({
  Authorization: "Bearer tahjisheiPaa9taem3oo",
  "Content-Type": "application/json",
  Accept: "application/json; charset=utf-8",
});

// const clear

describe.each(testAdapters.map((a) => a.toUpperCase()))(
  `Test: %s`,
  (adapter: string) => {
    adapter = adapter.toLowerCase() as DbAdapter;
    const target = config.testTargetUrl ?? app(adapter as DbAdapter)
    logger.warn(`Testing ${adapter} adapter at ${target}`);
    const request = supertest(target);

    describe.sequential(`Batch Requests ${adapter.toUpperCase()}`, () => {
      const users = Array(50).fill(null).map(createRandomUser);

      it(`Create batch: ${users.length}`, async () => {
        for await (const user of users) {
          const response = await request
            .post(`/api/facts/${user.key}`)
            .set(getHeaders())
            .send(user);

          console.log(response.body);
          expect(response.status).toBe(201);
          const expected = omit(user, ["_id", "id", "birthday"]);
          expect(response.body?.value).toMatchObject(expected);
        }
      });

      it(`Remove batch: ${users.length}`, async () => {
        for await (const user of users) {
          const response = await request
            .delete(`/api/facts/${user.key}`)
            .set(getHeaders());

          expect(response.status).toBe(204);
        }
      });
    });

    describe(`API Tests ${adapter.toUpperCase()}`, () => {
      const users = Array(20).fill(null).map(createRandomUser);
      beforeAll(async () => {
        for await (const user of users) {
          await request
            .post(`/api/facts/${user.key}`)
            .set(getHeaders())
            .send(user);
        }
      });
      afterAll(async () => {
        for await (const user of users) {
          await request.delete(`/api/facts/${user.key}`).set(getHeaders());
        }
      });

      it(`PUT /api/facts/user/456`, async () => {
        const response = await request
          .put(`/api/facts/user/456`)
          .set(getHeaders())
          .send({
            path: "user",
            key: "456",
            value: '{"json": true}',
          });

        expect(response.status).toBe(201);
      });

      it(`POST /api/facts/user/123`, async () => {
        const response = await request
          .post(`/api/facts/user/123`)
          .set(getHeaders())
          .send({
            note: "posted!",
            value: '{"json": true, "updated": "🚀"}',
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
      });

      it(`GET /api/facts/user/123`, async () => {
        const response = await request
          .get(`/api/facts/user/123`)
          .set(getHeaders());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
        expect(response.body.value).toMatchObject({
          note: "posted!",
          value: '{"json": true, "updated": "🚀"}',
        });
      });

      it(`GET /api/query/user`, async () => {
        const response = await request
          .get(`/api/query/user`)
          .set(getHeaders());

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(5);
      });

      it(`DELETE /api/facts/user/123`, async () => {
        const response = await request
          .delete(`/api/facts/user/123`)
          .set(getHeaders());

        expect(response.status).toBe(204);
      });
    });
  },
);

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

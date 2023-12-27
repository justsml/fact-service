import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "./app";
import { type DbAdapter, testAdapters } from "./lib/config";
import { omit } from "lodash";

const authorization = "Bearer tahjisheiPaa9taem3oo";
const basePath = `/api/facts`;

describe.each(testAdapters)(
  `Test: %s`,
  (adapter) => {
    const request = supertest(app(adapter as DbAdapter));

    describe.sequential(`Batch Requests ${adapter.toUpperCase()}`, () => {
      const users = Array(100).fill(null).map(createRandomUser);

      it(`Create batch: 100`, async () => {
        for await (const user of users) {
          const response = await request
            .post(`${basePath}/${user.key}`)
            .set("Content-Type", "application/json")
            .set("Authorization", authorization)
            .send(user);

          // console.log(response.body);
          expect(response.status).toBe(201);
          const expected = omit(user, ["id", "birthday"]);
          expect(response.body).toMatchObject([expected]);
        }
      });

      it(`Remove batch: 100`, async () => {
        for await (const user of users) {
          const response = await request
            .delete(`${basePath}/${user.key}`)
            .set("Authorization", authorization);

          expect(response.status).toBe(204);
        }
      });
    });

    describe(`API Tests ${adapter}`, () => {
      const users = Array(20).fill(null).map(createRandomUser);
      beforeAll(async () => {
        for await (const user of users) {
          await request
            .post(`${basePath}/${user.key}`)
            .set("Content-Type", "application/json")
            .set("Authorization", authorization)
            .send(user);
        }
      });
      afterAll(async () => {
        for await (const user of users) {
          await request
            .delete(`${basePath}/${user.key}`)
            .set("Authorization", authorization);
        }
      });

      it(`PUT ${basePath}/user/456`, async () => {
        const response = await request
          .put(`${basePath}/user/456`)
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

      it(`POST ${basePath}/user/123`, async () => {
        const response = await request
          .post(`${basePath}/user/123`)
          .set("Content-Type", "application/json")
          .set("Authorization", authorization)
          .send({
            note: "posted!",
            value: '{"json": true, "updated": "🚀"}',
          });

        expect(response.status).toBe(201);
        // Additional assertions
      });

      it(`GET ${basePath}/user/123`, async () => {
        const response = await request
          .get(`${basePath}/user/123`)
          .set("Authorization", authorization);

        expect(response.status).toBe(200);
        // Additional assertions
      });

      it(`GET ${basePath}/user/123?keyPrefix=user`, async () => {
        const response = await request
          .get(`${basePath}/user/123?keyPrefix=user`)
          .set({
            Authorization: authorization,
            "Content-Type": "application/json",
            Accept:
              "application/json; charset=utf-8, text/plain; charset=utf-8",
          });

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(20);
      });

      it(`DELETE ${basePath}/user/123`, async () => {
        const response = await request
          .delete(`${basePath}/user/123`)
          .set("Authorization", authorization);

        expect(response.status).toBe(204);
        // Additional assertions
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

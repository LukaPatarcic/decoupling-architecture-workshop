import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { ServiceBroker } from "moleculer";
import type { ProductEntity } from "../../services/tasks.service";
import TestService from "../../services/tasks.service";

describe("Test 'tasks' service", () => {
	describe("Test actions", () => {
		const broker = new ServiceBroker({ logger: false });
		const service = broker.createService(TestService);
		service.seedDB = null; // Disable seeding

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const record = {
			name: "Awesome item",
			price: 999,
		};
		let newID: string;

		test("should contains the seeded items", async () => {
			const res = await broker.call("tasks.list");
			expect(res).toEqual({ page: 1, pageSize: 10, rows: [], total: 0, totalPages: 0 });
		});

		test("should add the new item", async () => {
			const res: ProductEntity = await broker.call("tasks.create", record);
			expect(res).toEqual({
				_id: expect.any(String),
				name: "Awesome item",
				price: 999,
				quantity: 0,
			});
			newID = res._id;

			const res2 = await broker.call("tasks.count");
			expect(res2).toBe(1);
		});

		test("should get the saved item", async () => {
			const res: ProductEntity = await broker.call("tasks.get", { id: newID });
			expect(res).toEqual({
				_id: expect.any(String),
				name: "Awesome item",
				price: 999,
				quantity: 0,
			});

			const res2 = await broker.call("tasks.list");
			expect(res2).toEqual({
				page: 1,
				pageSize: 10,
				rows: [{ _id: newID, name: "Awesome item", price: 999, quantity: 0 }],
				total: 1,
				totalPages: 1,
			});
		});

		test("should update an item", async () => {
			const res = await broker.call("tasks.update", { id: newID, price: 499 });
			expect(res).toEqual({
				_id: expect.any(String),
				name: "Awesome item",
				price: 499,
				quantity: 0,
			});
		});

		test("should get the updated item", async () => {
			const res = await broker.call("tasks.get", { id: newID });
			expect(res).toEqual({
				_id: expect.any(String),
				name: "Awesome item",
				price: 499,
				quantity: 0,
			});
		});

		test("should increase the quantity", async () => {
			const res = await broker.call("tasks.increaseQuantity", { id: newID, value: 5 });
			expect(res).toEqual({
				_id: expect.any(String),
				name: "Awesome item",
				price: 499,
				quantity: 5,
			});
		});

		test("should decrease the quantity", async () => {
			const res = await broker.call("tasks.decreaseQuantity", { id: newID, value: 2 });
			expect(res).toEqual({
				_id: expect.any(String),
				name: "Awesome item",
				price: 499,
				quantity: 3,
			});
		});

		test("should remove the updated item", async () => {
			const res = await broker.call("tasks.remove", { id: newID });
			expect(res).toBe(1);

			const res2 = await broker.call("tasks.count");
			expect(res2).toBe(0);

			const res3 = await broker.call("tasks.list");
			expect(res3).toEqual({ page: 1, pageSize: 10, rows: [], total: 0, totalPages: 0 });
		});
	});
});

import { testCallResolver } from "../../util/testResolver";
import { GREETING } from "./greeting";

const { getGreeting, greet } = await import("./greeting");

describe("Greeting resolvers", () => {
  it("gets current greeting", async () => {
    const greeting = await testCallResolver({
      args: {},
      resolverFunc: getGreeting,
    });
    expect(greeting.currentGreeting).toBe(GREETING);
  });

  it("greets user by name", async () => {
    const greeting = await testCallResolver({
      args: { name: "Lebowski" },
      resolverFunc: greet,
    });
    expect(greeting.greeting).toBe(`${GREETING}, Lebowski!`);
  });
});

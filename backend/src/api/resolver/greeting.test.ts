import { testCallResolver } from '../../util/testResolver'
import { getGreeting, GREETING, greetInner } from './greeting'

describe('Greeting resolvers', () => {
  it('gets current greeting', async () => {
    const greeting = getGreeting()
    expect(greeting.currentGreeting).toBe(GREETING)
  })

  it('greets user by name', async () => {
    const greeting = await testCallResolver({
      userName: 'cognitoUsername',
      args: { name: 'Lebowski' },
      resolverFunc: greetInner,
    })
    expect(greeting.greeting).toBe(`${GREETING}, Lebowski!`)
  })
})

const encoder = new TextEncoder()

const greetText = encoder.encode('Hello World\nthe name is wom')

await Deno.writeFile("greet.txt", greetText)
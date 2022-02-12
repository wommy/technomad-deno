import { Client } from "https://deno.land/x/postgres/mod.ts";
import { Product } from '../types.ts'
const dbCreds ={
	user: "wom",
	database: "denoapi",
	password: "jimithefrog",
	hostname: "localhost",
	port: 5432
}

const client = new Client(dbCreds)

// @desc	Get all products
// @route	GET /api/v1/products
const getProducts = async ({ response }:{ response:any }) => {
	try {
		await client.connect()
		const result = await client.queryArray`SELECT * FROM products`

		const products = new Array()
		result.rows.map(p => {
			let obj:any = new Object()
			result.rowDescription?.columns.map((el,i)=>{
				obj[el.name] = p[i]
			})
			products.push(obj)
		})

		response.body = {
			success: true,
			data: products
		}
	} catch (err) {
		response.status = 500
		response.body = {
			success: false,
			msg: err.toString()
		}
	} finally {
		await client.end()
	}
}

// @desc	Add product
// @route	POST /api/v1/products
const addProduct = async ({ request, response }: { request: any, response: any }) => {    
	const body = await request.body();
	const product = await body.value

	if (!request.hasBody) {
		response.status = 400
		response.body = {
			success: false,
			msg: 'No data'
		}
	} else {
		try {
			await client.connect()

			const result = await client.queryArray
				`INSERT INTO products(name, description, price) VALUES(${product.name}, ${product.description}, ${product.price})`
			
			response.status = 201
			response.body = {
				success: true,
				data: product
			}
		} catch (err) {
			response.status = 500
			response.body = {
				success: false,
				msg: err.toString()
			}
		} finally {
			await client.end()
		}
	}
}

// @desc	Get single product
// @route	GET /api/v1/products/:id
const getProduct = async ({ params, response }:{ params: { id: string }, response:any }) => {
	try {
		await client.connect()
		const result = await client.queryArray`SELECT * FROM products WHERE id = ${params.id}`
		if(result.rows.toString() === "" ){
			response.status = 404
			response.body = {
				success: false,
				msg: `no product with the id of ${params.id}`
			}
			return
		} else {
			const product: any = new Object()
			result.rows.map(p => {
				result.rowDescription?.columns.map((el,i) => {
					product[el.name] = p[i]
				})
			})
			response.body = {
				success: true,
				data: product
			}
		}
	} catch (err) {
		response.status = 500
		response.body = {
			success: false,
			msg: err.toString()
		}
	} finally {
		await client.end()
	}
}

// @desc	Update product
// @route	PUT /api/v1/products/:id
const updateProduct = async ({ params, request, response }:{ params: { id: string }, request: any, response:any }) => {
	await getProduct({ params: { "id": params.id }, response })
	if(response.status === 404) {
		response.body = {
			success: false,
			msg: response.body.msg
		}
		response.status = 404
		return
	} else {
		const body = await request.body()
		const product = await body.value
		if (!request.hasBody) {
			response.status = 400
			response.body = {
				success: false,
				msg: 'No data'
			}
		} else {
			try {
				await client.connect()
	
				const result = await client.queryArray
					`UPDATE products SET name=${product.name}, description=${product.description}, price=${product.price} WHERE id=${params.id}`
				
				response.status = 200
				response.body = {
					success: true,
					data: product
				}
			} catch (err) {
				response.status = 500
				response.body = {
					success: false,
					msg: err.toString()
				}
			} finally {
				await client.end()
			}
		}
	}
}

// @desc	Delete product
// @route	DELETE /api/v1/products/:id
const deleteProduct = async ({ params, response }:{ params: { id: string }, response:any }) => {
	// products = products.filter(p => p.id !== params.id)
	// response.body = {
	// 	success: true,
	// 	msg: 'product removed'
	// }
	await getProduct({ params: { "id": params.id }, response })
	if(response.status === 404) {
		response.body = {
			success: false,
			msg: response.body.msg
		}
		response.status = 404
		return
	} else {
		try {
			await client.connect()
			const result = await client.queryArray
				`DELETE FROM products WHERE id=${params.id}`
			response.body = {
				success: true,
				msg: `product with id ${params.id} has been deleted`
			}
			response.status = 204
		} catch (err) {
			response.status = 500
			response.body = {
				success: false,
				msg: err.toString()
			}
		} finally {
			await client.end()
		}
	}
}

export { getProducts, addProduct, getProduct, updateProduct, deleteProduct }
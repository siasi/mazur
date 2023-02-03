import * as fs from 'fs'
import knex from 'knex'

/*export const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'string123',
    database : 'postgres'
  }
});*/

export const db = knex({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'string123',
    database: 'mysql',
    charset: 'utf8mb4',
  },
})

export function saveToFile(filename, results) {
  // stringify JSON Object
  let textContent = JSON.stringify(results, null, 2)

  fs.writeFile(filename, textContent, 'utf8', function (err) {
    if (err) {
      console.log('An error occured while writing JSON Object to File.')
      return console.log(err)
    }

    console.log('JSON file has been saved.')
  })
}

export function readFromFile(path) {
  return JSON.parse(fs.readFileSync(path, { encoding: 'utf8', flag: 'r' }))
}

export async function saveRows(rows, tableName, returningField = 'id') {
  const chunkSize = 1000
  try {
    const ids = await db
      .batchInsert(tableName, rows, chunkSize)
      .returning(returningField)
    console.log('Saved ' + ids.length + ' rows in ' + tableName + ' Table')
  } catch (error) {
    console.log(error)
  }
}

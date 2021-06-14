module.exports = {
    "type": "postgres",
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "synchronize": true,
    "logging": false,
    "entities": [
        "build/socialmedia/domain/entities/**/*.js"
    ],
    "migrations": [
        "build/migration/**.js"
    ],
    "subscribers": [
        "build/src/subscriber/**/*.js"
    ],
    "cli": {
        "entitiesDir": "src/socialmedia/domain/entities",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
    }
}

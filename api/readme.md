# api

> 

## About

This project uses [Feathers](http://feathersjs.com). An open source framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/api
    npm install
    ```

3. Start your app

    Set `FEATHERS_SECRET` to a unique secret in the environment before starting the API. Startup fails when it is missing or empty.

    ```
    npm run compile # Compile TypeScript source
    npm run migrate # Run migrations to set up the database
    npm start
    ```

## Testing

Run `npm test` and all your tests in the `test/` directory will be run.

## Post images

Submit a post with up to six images using `POST /posts-create` and a bearer token. Send `multipart/form-data` fields `text`, `description`, `price`, `location`, and zero to six `images` files. JPEG, PNG, and WebP files up to 10 MB each are accepted. The response contains the post and ordered image records. A failed submission rolls back the database transaction and removes files already moved into place.

Set `POST_IMAGE_DIRECTORY` to the absolute directory shared with Nginx. The default is `./uploads/post-images` relative to the API process working directory. Configure Nginx to map `/post-images/` to this directory and Cloudflare to cache that path. Each image gets a unique filename so its URL can be cached without overwriting old content. Back up this directory together with SQLite.

Example Nginx location:

```nginx
location /post-images/ {
    alias /absolute/path/to/post-images/;
    try_files $uri =404;
}
```

## Scaffolding

This app comes with a powerful command line interface for Feathers. Here are a few things it can do:

```
$ npx feathers help                           # Show all commands
$ npx feathers generate service               # Generate a new Service
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

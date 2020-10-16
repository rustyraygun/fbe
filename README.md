Simple Blog Template
=========================

## How to use

1. Remix this
2. Set the following env variables:
  * DB_USER - can be anything
  * DB_PASS - again, can be anything. Some random password is good
  * * SESSION_SECRET - any random string
  * PASSWORD - the password you will use to sign in and create, update, or delete posts
3. Now you can either interact with the blog via html, or you can use the html as an admin portal and use the `/api/posts` and `/api/posts/:id` endpoints to create a js-based front-end for your blog
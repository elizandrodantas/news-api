# NEWS-API :statue_of_liberty:

project searches for articles in some Brazilian news sites;

designed for educational purposes. any copyright infringement, [contact](#contact);

# Sources used in code :earth_americas:

- G1
### https://g1.globo.com/
- R7
### https://www.r7.com/
- EL PAIS BRAZIL
### https://brasil.elpais.com/

# Table of contents

- [Authorization](#authorization---v01)
- [Register](#register---v01)
- [Check if parameters are already registered](#check-if-parameters-are-already-registered---v01)
- [Refresh Token](#refresh-token---v01)
- [User info](#user-info---v01)
- [Confirm email](#confirm-email---v01)
- [Get user info](##get-user-info-not-required-authorization---v01)
- [Re-send email confirmation](#re-send-email-confirmation---v01)
- [News](#news---list-articles)
  - [List Articles](#news---list-articles)
  - [List Categories](#news---list-categories)
  - [Create Storage](#news---creating-storage)
  - [Content Article](#news---content-article)
- [Wordpress](#wordpress---create-service)
  - [Create Service](#wordpress---create-service)
  - [List Services](#wordpress---list-services)
  - [List Categories](#wordpress---list-categories)
  - [Add categories](#wordpress---add-categories)
  - [List Tags](#wordpress---list-tags)
  - [Add Tags](#wordpress---add-tags)
  - [Add Media](#wordpress---add-media)
  - [Create Post](#wordpress---create-post)
  - [Job details](#wordpress---job-details)
  - [List all-jobs](#wordpress---list-all-jobs)
  - [Status sources](#wordpress---status-sources)
- [Admin](#admin---user-permission-required)
  - [User](#admin---user-permission-required)
  - [ACL](#admin---acl-required-permission)
  - [Permission](#admin---permission-required-permission)
- [Contant](#contact)

# Install
  ```npm install```
  ###### #or
  ```yarn install```

# Endpoint :coffee:

## Authorization - v0.1

```txt
curl --request POST \
  --url http://localhost:8080/v1/auth \
  --header 'Content-Type: application/json' \
  --data '{
	"password": "admin",
	"username": "admin"
}'
```

## Register - v0.1

```txt
  curl --request POST \
  --url http://localhost:8080/v1/register \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "name",
	"lastname": "last",
	"password": "admin",
	"username": "admin",
	"email": "mail@newstech.com",
	"cell": "11900000000"
}'
```

## Check if parameters are already registered - v0.1

**username**
```txt
  curl --request GET \
  --url http://localhost:8080/v1/register/user/{username} \
  --header 'Content-Type: application/json'
```
**email**
```txt
  curl --request GET \
  --url http://localhost:8080/v1/register/email/{email} \
  --header 'Content-Type: application/json'
```

**cellphone**
```txt
  curl --request GET \
  --url http://localhost:8080/v1/register/cellphone/{cellphone} \
  --header 'Content-Type: application/json'
```

## Refresh token - v0.1

```txt
  curl --request GET \
  --url http://localhost:8080/v1/auth/refresh \
  --header 'Authorization: Bearer {token}'
```

## User info - v0.1

```txt
 curl --request GET \
  --url http://localhost:8080/v1/user \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json'
```

## Confirm email - v0.1

```txt
curl --request POST \
  --url http://localhost:8080/v1/user/email/c \
  --header 'Content-Type: application/json' \
  --data '{
	"code": "{code}"
	"id": "{userId}
}'
```

## Get user info (not required authorization) - v0.1

```txt
  curl --request GET \
  --url http://localhost:8080/v1/auth/u/{username} \
  --header 'Content-Type: application/json'
```

## Re-send email confirmation - v0.1

```txt
  curl --request GET \
  --url http://localhost:8080/v1/user/email/send \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json'
```

## NEWS - List Articles

**GET**
```txt
  curl --request GET \
  --url 'http://localhost:8080/v1/api/news/list?{options}' \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json'
```

**POST**
```txt
  curl --request POST \
  --url 'http://localhost:8080/v1/api/news/list' \
  --header 'Authorization: Bearer {token}'
  --header 'Content-Type: application/json' \
  --data '{options}'
```

**SEARSH OPTIONS** (* required)
- category: string **(search for [categories](#news---list-categories) in endpoint)**
- intitle: string **(word search in title)**
- limit: number | null
- source: "r7" | "g1" | "elpais" **(comma separated for results from more than one source)**

## NEWS - List Categories

```txt
  curl --request GET \
  --url 'http://localhost:8080/v1/api/news/category?{options}' \
  --header 'Authorization: Bearer {token}'
```

**SEARSH OPTIONS** (* required)
- source: "r7" | "g1" | "elpais" **(comma separated for results from more than one source)**

## NEWS - Create Storage

```txt
curl --request GET \
  --url http://localhost:8080/v1/api/news/storage/add/{id_article} \
  --header 'Authorization: Bearer {token}'
```

**Article id is found in the result of [article list](#news---list-articles) endpoint**

## NEWS - Content Article

```txt
  curl --request GET \
  --url http://localhost:8080/v1/api/news/content/{id} \
  --header 'Authorization: Bearer {token}'
```

**{id} found in [storage response](#news---creating-storage) or [article list response](#news---list-articles)

## WORDPRESS - Create Service

```txt
  curl --request POST \
  --url http://localhost:8080/v1/api/wordpress/add/ \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"url": "{url}",
	"username": "{username}",
	"password": "{password}"
}'
```

**OPTIONS** (* required)
- *{url}: string **(url wordpress system)**
- *{username}: string **(username using login in portal admin)**
- *{password}: string **(password using login in portal admin)**

**PLUGIN REQUIRED**
- JWT AUTH
> RECOMENDED: [JWT Authentication for WP REST API](https://ve.wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)

## WORDPRESS - List Services

```txt
  curl --request GET \
  --url http://localhost:8080/v1/api/wordpress \
  --header 'Authorization: Bearer {token}'
```

## WORDPRESS - List Categories

```txt
curl --request GET \
  --url http://localhost:8080/v1/api/wordpress/get/category/{service_id} \
  --header 'Authorization: Bearer {token}'
```

**{service_id} found in [list services](#wordpress---list-services)**

## WORDPRESS - Add categories

```txt
  curl --request POST \
  --url http://localhost:8080/v1/api/wordpress/add/category/{service_id} \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"name": string[],
	"description": string[]
}'
```

**{service_id} found in [list services](#wordpress---list-services)**

## WORDPRESS - List Tags

```txt
 curl --request GET \
  --url http://localhost:8080/v1/api/wordpress/get/tags/{service_id} \
  --header 'Authorization: Bearer {token}'
```

**{service_id} found in [list services](#wordpress---list-services)**

## WORDPRESS - Add Tags

```txt
 curl --request POST \
  --url http://localhost:8080/v1/api/wordpress/add/tag/{service_id} \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"name": string[],
	"description": string[]
}'
```

**{service_id} found in [list services](#wordpress---list-services)**

## WORDPRESS - Add Media

```txt
curl --request POST \
  --url http://localhost:8080/v1/api/wordpress/add/media/{service_id} \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"description": {description},
	"caption": "{caption}",
	"url": "{url}",
	"status": "{status}"
}'
```

**OPTIONS** (* required)
- *{url}: string **(url image send wordpress)**
- {description}: string **(description image)**
- {caption}: string **(caption image)**
- {status}: "publish" | "pending" **(default: pending)**

**{service_id} found in [list services](#wordpress---list-services)**
**{url} found in [content](#news---content-article)**

## WORDPRESS - Create Post

```txt
  curl --request POST \
  --url http://localhost:8080/v1/api/wordpress/add/post/{service_id} \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"status": "{status}",
	"category": {category},
	"id": "{id}",
	"media_id": {media_id}
}'
```

**OPTIONS** (* required)
- {status}: "publish" | "future" | "pending" | "private" **(default: pending)**
- {password}: string **(required if {status} is private)**
- {category}: number[] **(array categories id)**
- *{id}: string **(found in [storage response](#news---creating-storage) or [article list response](#news---list-articles))**
- {media_id}: number **(id featured image)**

**{service_id} found in [list services](#wordpress---list-services)**

## WORDPRESS - Job details

```txt 
curl --request GET \
  --url http://localhost:8080/v1/api/wordpress/job/{job_id} \
  --header 'Authorization: Bearer {token}'
```

**{job_id} found in response [created post](#wordpress---create-post)**

## WORDPRESS - List all jobs

```txt
curl --request GET \
  --url http://localhost:8080/v1/api/wordpress/report/{service_id} \
  --header 'Authorization: Bearer {token}'
```

**{service_id} found in [list services](#wordpress---list-services)**

## WORDPRESS - Status sources

```txt
curl --request GET \
  --url http://localhost:8080/v1/api/wordpress/status \
  --header 'Authorization: Bearer {token}'
```

## ADMIN - User (permission required)

**list all user**

```txt
curl --request GET \
  --url http://localhost:8080/v1/admin/user/list \
  --header 'Authorization: Bearer {token}'
```

**user details**

```txt
curl --request GET \
  --url http://localhost:8080/v1/admin/user/{userId} \
  --header 'Authorization: Bearer {token}'
```

**add user**

```txt
 curl --request POST \
  --url http://localhost:8080/v1/admin/user/add \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "{name}",
	"username": "{username}",
	"password": "{password}",
	"cell": "{cell}",
	"email": "{email}",
	"lastname": "{lastname}"
}'
```
**block user**

```txt
curl --request PUT \
  --url http://localhost:8080/v1/admin/user/block \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"id": "{userId}"
}'
```

**unlock user**

```txt
curl --request PUT \
  --url http://localhost:8080/v1/admin/user/unlock \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"id": "{userId}"
}'
```

**edit user**

```txt
curl --request PUT \
  --url http://localhost:8080/v1/admin/user/edit \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"id": "{userId}",
	"name": "{name}",
	"lastname": "{lastname}",
	"cellphone": "{cell}",
	"email": "{email}",
}'
```

**remove user**

```txt
curl --request DELETE \
  --url http://localhost:8080/v1/admin/user/remove \
  --header 'Authorization: Bearer {userId}' \
  --header 'Content-Type: application/json' \
  --data '{
	"id": "{userId}"
}'
```

## ADMIN - ACL (required permission)

**list permission user**

```txt
curl --request GET \
  --url http://localhost:8080/v1/admin/acl/list/user/{userId} \
  --header 'Authorization: Bearer {token}'
```

**add permission user**

```txt
curl --request POST \
  --url http://localhost:8080/v1/admin/acl/add/user \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"user_id": "{userId}",
	"permission_id": "{permissionId}"
}'
```

**remove permission user**

```txt
curl --request DELETE \
  --url http://localhost:8080/v1/admin/acl/remove/user \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"user_id": "{userId}",
	"permission_id": "{permissionId}"
}'
```

## ADMIN - Permission (required permission)

**list permissions**

```txt
curl --request GET \
  --url http://localhost:8080/v1/admin/permission/list \
  --header 'Authorization: Bearer {token}'
```

**add permission**

```txt
curl --request POST \
  --url http://localhost:8080/v1/admin/permission/add \
  --header 'Authorization: Bearer {token}' \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "{name}",
	"description": "{description}"
}'
```

# Contact

![This is an image](https://www.instagram.com/static/images/ico/favicon.ico/36b3ee2d91ed.ico) [@elizandrodantas](http://instagram.com/elizandrodantas)


[back to top](#news-api-v3-statue_of_liberty)

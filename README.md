#JustSport 

JustSport es un aplicaicón diseñada para facilitar la difusión de los gimnasios, centros deportivos, y cualquier centro de dicho de ámbito.
Con ella podrás anunciarte y facilitar a los usuarios, toda la información relativa a las clases y actividades deportivas que ofertas. La 
aplicación expone su propia API Rest.

#Guía para desarrolladores 

A continuación, se proporcionará una pequeña guía para los desarrolladores y cualquier persona que quiera hacer uso de ella. JustSport está
en estado de desarollo, por lo que la documentación se irá actualizando a medida que se vayan incorporando nuevas caracterísitcas, o se sufran 
modificaciones.

##API

###Paginación 

Todos los endpoints que apunten a la recopilación de colecciones, hacen uso de paginación mediante cursores. Por defecto, la paginación está limitada a 5 elementos, pero 
se puede establecer el número que se crea conveniente:  

**_api/sports?limit=2:_** Mediante el parámetro limit, se establece el límite de la paginación. 

El uso de los cursores será de la siguiente forma: 

**_api/sports?after=Mg==&limit=2:_** Mediante el parámetro after, se especifica, que la información de la colección, comenzará tras el elemento "after".

**_api/sports?before=Mg==&limit=2:_** Mediante el parámetro before, se especifica, que la información de la colección, comenzará tras el elemento "before".

###Autenticación 

Muchas de las rutas están protegidas. La autenticación de la aplicación se maneja mediante OAuth2. Es las próximas versiones se especificará como hacer 
uso de la autenticación en más detalle. 

Por el momento, y tras estar registrado, basta con hacer una petición al siguiente endpoint: 

**_/api/oauth2/token?username=ua.norman@gmail.com&password=norman2015&grant_type=password&client_id=2xa001za-78b3-4f38-9376-e2dd88b7c682_**

El parámetro "client_id" no es un parámetro obligatorio, pero por defecto, en caso de usarlo, se usará el del cliente oficial (el cual está indicado en el ejemplo).
La API REST corre sobre el protocolo HTTPS, por lo que no se ha de ser temeroso a la hora de introducir el usuario y password en la aplicación oficial.

###Hipermedia 

Se ha provisto a la API de hipermedia, por lo que en el mayoría de endpoints, se puede ver como seguir interactuando con la API a partir de ese punto. 
La hipermedia aún está por especificar completamente, y sufrirá fuertes modificaciones. 

###Endpoints 

| Ruta          	                                     | Método      |      Rol     |
| -------------------------------------------------------|:-----------:|:------------:|
| api/users/new                                          | POST        |  Propietario |
| api/users/:id                                          | GET         |  Público     |
| api/users/:id                                          | DELETE      |  Usuario     |
| api/clients/new                                        | POST        |  Propietario | 
| api/clients/:id_user                                   | GET         |  Propietario | 
| api/sports/new                                         | POST        |  Propietario | 
| api/sports/                                            | GET         |  Público     | 
| api/sports/:id/establishments                          | GET         |  Público     |
| api/sports/:id                                         | PUT         |  Propietario | 
| api/sports/:id                                         | DELETE      |  Admin       | 
| api/establishments/new                                 | POST        |  Propietario | 
| api/establishments/                                    | GET         |  Público     | 
| api/establishments/:id                                 | GET         |  Público     | 
| api/establishments/:id/sports                          | GET         |  Público     | 
| api/establishment/sports/:id/location/:location        | GET         |  Público     | 
| api/establishments/:id                                 | PUT         |  Propietario | 
| api/establishments/:id                                 | DELETE      |  Propietario |
| api/courses/new                                        | POST        |  Propietario | 
| api/courses/:id                                        | GET         |  Público     | 
| api/courses/:id                                        | PUT         |  Propietario | 
| api/courses/:id                                        | DELETE      |  Propietario |

###Usuarios

####POST api/users/new

Permite al usuario registrarse. Por defecto los usuarios serán del tipo "usuario". Pero este valor se puede establecer también a
"owner" para conseguir los privilegios que este rol otorga. El campo que establece el nivel de privilegios es "role". Devuelve el usuario 
creado si ha la operación ha tenido éxito. 

#####Ruta del Recurso

*https://localhost:3000/api/users/new*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | Público   |


#####Ejemplo del Resultado

```javascript
{
  "uuid": "26b408e3-b1bc-4afb-b85a-211269eb7815",
  "name": "Luis",
  "lname": "Lillo Cano",
  "email": "llca@gmail.com",
  "gender": "male",
  "role": "owner"
}
```

####GET api/users/:id

Obtiene la información del usuario especificado. 

#####Ruta del Recurso

*https://localhost:3000/api/users/:id*

#####Parámetros 

**id:**      La id del usuario el cual queremos obtener la información.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | Público   |


#####Ejemplo de Petición 

GET 
*https://localhost:3000/api/users/26b408e3-b1bc-4afb-b85a-211269eb7815*

#####Ejemplo del Resultado

```javascript
{
  "uuid": "26b408e3-b1bc-4afb-b85a-211269eb7815",
  "name": "Luis",
  "lname": "Lillo Cano",
  "email": "llca@gmail.com",
  "gender": "male",
  "role": "owner"
}
```

El password del usuario se preserva, y no se incluye en la respuesta (aunque sea este el que está realizando la petición)

####DELETE api/users/:id

Permite al usuario dar de baja su cuenta. Se requiere ser el propietario de la cuenta a eliminar en cuestión. Devuelve el 
estado 204 en caso de éxito de la operación.

#####Ruta del Recurso

*https://localhost:3000/api/users/:id*

#####Parámetros 

**id:**      La id del usuario el cual queremos obtener la información.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | Público   |

#####Ejemplo de Petición 

DELETE 
*https://localhost:3000/api/users/26b408e3-b1bc-4afb-b85a-211269eb7815*



###Clientes

Los clientes son necesarios para poder hacer uso de la API desde una aplicación externa a la oficial. Necesitarás estar registrado en la misma, antes
de poder crear un Cliente.

####POST api/clients/new

Crea un nuevo cliente asociado a un usuario. Este cliente es único. Devolverá la información del cliente creado.

#####Ruta del Recurso

*https://localhost:3000/api/clients/new*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | Sí            | Usuario   |

#####Ejemplo de Petición 

POST
*https://localhost:3000/api/users/new* 

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

```javascript
{
    "name" : "Second Client", "userId" : "26b408e3-b1bc-4afb-b85a-211269eb7815"
}
```

#####Ejemplo del Resultado

```javascript
{
  "clientId": "53eda9ab-b726-403d-af56-1accde2df8df",
  "clientSecret": "18e1b644-b7ec-4287-8886-23dbd0fe67e0",
  "id": 2,
  "name": "Second Life",
  "userId": "26b408e3-b1bc-4afb-b85a-211269eb7815",
  "updatedAt": "2015-11-10T09:58:14.000Z",
  "createdAt": "2015-11-10T09:58:14.000Z"
}
```

####GET api/clients/:user_id

Devuelve una colección de los clientes que pertenecen al usuario

#####Ruta del Recurso

*https://localhost:3000/api/clients/:user_id*

#####Parámetros 

**user_id:**      La id del usuario del cual se quiere obtener la colección de clientes.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | Sí            | Usuario   |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/users/26b408e3-b1bc-4afb-b85a-211269eb7815* 

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

#####Ejemplo del Resultado

```javascript
{
  "id": 2,
  "name": "Second Life",
  "clientId": "53eda9ab-b726-403d-af56-1accde2df8df",
  "userId": "26b408e3-b1bc-4afb-b85a-211269eb7815",
  "createdAt": "2015-11-10T09:58:14.000Z",
  "updatedAt": "2015-11-10T09:58:14.000Z"
}
```

###Deportes

####POST api/sports/new

Permite al usuario registrar un nuevo deporte. Este no va vinculado de forma directa a ningún establecimiento, ya que los deportes 
poseen muchos establecimientos y viceversa. Se establece una relación N:M entre ellos. Devolverá el recurso creado.

#####Ruta del Recurso

*https://localhost:3000/api/sports/new*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

POST
*https://localhost:3000/api/sports/new* 

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

```javascript
{
    "name":"Pilates"
}
```

#####Ejemplo del Resultado

```javascript
{
  "id": 6,
  "name": "Pilates",
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/sports/new"
      },
      {
        "rel": "update",
        "href": "https://localhost:3000/api/sports/6"
      },
      {
        "rel": "delete",
        "href": "https://localhost:3000/api/sports/6"
      }
    ]
  ]
}
```

####GET api/sports

Devuelve la colección de todos los deportes registrados en la API.

#####Ruta del Recurso

*https://localhost:3000/api/sports/*

#####Parámetros 

**limit:**      El número de deportes que se quiere incluir en la colección (por defecto 5)
*opcional*

**after:**      El deporte tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte especificado (hacia delante).
*opcional*

**before:**     El deporte tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte especificado (hacia atrás).
*opcional*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/sports/* 


#####Ejemplo del Resultado

```javascript
{
  "sports": [
    {
      "id": 1,
      "name": "Spinning",
      "createdAt": "2015-11-09T12:45:23.000Z",
      "updatedAt": "2015-11-09T12:45:23.000Z"
    },
    {
      "id": 2,
      "name": "GAP",
      "createdAt": "2015-11-09T12:45:23.000Z",
      "updatedAt": "2015-11-09T12:45:23.000Z"
    },
    {
      "id": 3,
      "name": "Body Jump",
      "createdAt": "2015-11-09T12:45:23.000Z",
      "updatedAt": "2015-11-09T12:45:23.000Z"
    },
    {
      "id": 4,
      "name": "Zumba",
      "createdAt": "2015-11-09T12:45:23.000Z",
      "updatedAt": "2015-11-09T12:45:23.000Z"
    },
    {
      "id": 5,
      "name": "Crossfit",
      "createdAt": "2015-11-09T12:45:23.000Z",
      "updatedAt": "2015-11-09T12:45:23.000Z"
    }
  ],
  "paging": {
    "cursors": {
      "before": 0,
      "after": "NQ=="
    },
    "previous": "none",
    "next": "https://localhost:3000/api/sports?after=NQ==&limit=5"
  },
  "links": {
    "rel": "self",
    "href": "https://localhost:3000/api/sports"
  }
}
```

####GET api/sports/:id

Devuelve la información del deporte especificado.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id*

#####Parámetros 

**id:**      La id del deporte el cual queremos obtener la información.

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/sports/2* 


#####Ejemplo del Resultado

```javascript
{
  "id": 2,
  "name": "GAP",
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/sports/2"
      },
      {
        "rel": "establishments",
        "href": "https://localhost:3000/api/sports/2/establishments"
      }
    ]
  ]
}
```

####GET api/sports/:id/establishment

Devuelve la colección de todos los establecimientos, los cuales tienen asociados dicho deporte. De cada establecimiento, se devolverá también
la información pública de su propietario.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id/establishemnts*

#####Parámetros 

**id:**      La id del deporte el cual queremos obtener la colección de establecimientos.
*obligatorio* 

**limit:**      El número de establecimientos que se quiere incluir en la colección (por defecto 5)
*opcional*

**after:**      El deporte tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte especificado (hacia delante).
*opcional*

**before:**     El deporte tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte especificado (hacia atrás).
*opcional*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/sports/1/establishments* 


#####Ejemplo del Resultado

```javascript
{
  "Establishments": [
    {
      "id": 1,
      "name": "Gym A Tope",
      "desc": "Gimnasio perfecto para realizar tus actividades deportivas.",
      "city": "San Vicente del Raspeig",
      "province": "Alicante",
      "addr": "Calle San Franciso nº15",
      "phone": "965660327",
      "website": "http://wwww.gymatope.es",
      "main_img": "atope.jpeg",
      "Owner": {
        "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
        "name": "Norman",
        "lname": "Coloma García",
        "email": "ua.norman@gmail.com",
        "gender": "male"
      }
    },
    {
      "id": 2,
      "name": "Gym Noray",
      "desc": "Gimnasio muy acondicionado y en perfecto estado.",
      "city": "Santa Pola",
      "province": "Alicante",
      "addr": "Calle Falsa nº34",
      "phone": "965662347",
      "website": "http://wwww.noraygym.com",
      "main_img": "noray.jpeg",
      "Owner": {
        "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
        "name": "Norman",
        "lname": "Coloma García",
        "email": "ua.norman@gmail.com",
        "gender": "male"
      }
    },
    {
      "id": 4,
      "name": "Montemar",
      "desc": "Especializados en cursos y clases de ténis.",
      "city": "Alicante",
      "province": "Alicante",
      "addr": "Avenida Novelda Km 14",
      "phone": "965662268",
      "website": "http://wwww.montemar.es",
      "main_img": "montemar.jpeg",
      "Owner": {
        "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
        "name": "Norman",
        "lname": "Coloma García",
        "email": "ua.norman@gmail.com",
        "gender": "male"
      }
    }
  ],
  "paging": {
    "cursors": {
      "before": 0,
      "after": 0
    },
    "previous": "none",
    "next": "none"
  },
  "links": {
    "rel": "self",
    "href": "https://localhost:3000/api/sports/1/establishments"
  }
}
```

####PUT api/sports/:id

Actualiza la información del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario. Devuelve el 
estado 204 en caso de éxito de la operación.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id*

#####Parámetros 

**id:**      La id del deporte el cual queremos modificar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

PUT
*https://localhost:3000/api/sports/3*

```javascript
{
  "name": "Body Jump",
}
```

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

####DELETE api/sports/:id

Elimina el deporte especificado mediante su id. Con intención de que no se puedan llevar a cabo acciones malintencionadas, y que cualquier usuario
con privilegios de propietario pueda eliminar un deporte (ya que recordemos que los deportes no pertenecen a ningún usuario específico), esta operación
solo está permitida a usuarios con privilegios de administrador Devuelve el estado 204 en caso de éxito de la operación.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id*

#####Parámetros 

**id:**      La id del deporte el cual queremos modificar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Administrador |

#####Ejemplo de Petición 

DELETE
*https://localhost:3000/api/sports/3*

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

###Establecimientos

####POST api/establishments/new

Permite al usuario registrar un nuevo establecimeinto. Un establecimiento posee muchos deportes, pero recordamos que la relación
entre ambos es N:M, de forma que un establecimiento contendrá muchos deportes, pero un deporte pertenecerá a más de un establecimiento. Con esto se pretende conseguir
una mayor coperación por parte de los clientes que hagan uso de la API. Devolverá el establecimiento creado en caso de éxito.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/new*


#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

POST
*https://localhost:3000/api/establishemnts/new* 

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

```javascript
{
    "name":"Total Sport", "desc":"Total Sport es un gimnasio que ofrece las mejores condiciones para ponerte en forma",
    "city":"Alicante", "province":"Alicante", "addr":"Calle Alfonso el Sabio", "phone" :"965663030", 
    "owner" : "3a8a07f5-1f9e-404a-b098-094462f947c6"
}
```

#####Ejemplo del Resultado

```javascript
{
  "id": 9,
  "name": "Total Sport",
  "desc": "Total Sport es un gimnasio que ofrece las mejores condiciones para ponerte en forma",
  "city": "Alicante",
  "province": "Alicante",
  "addr": "Calle Alfonso el Sabio",
  "phone": "965663030",
  "owner": "3a8a07f5-1f9e-404a-b098-094462f947c6",
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/establishments/new"
      },
      {
        "rel": "update",
        "href": "https://localhost:3000/api/establishments/9"
      },
      {
        "rel": "delete",
        "href": "https://localhost:3000/api/establishments/9"
      },
      {
        "rel": "clean",
        "href": "https://localhost:3000/api/establishments/9/sports"
      },
      {
        "rel": "impart",
        "href": "https://localhost:3000/api/establishments/9/sports/{id}"
      }
    ]
  ]
}
```

####GET api/establishments

Devuelve la colección de todos los establecimientos, registrados en la API.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts*

#####Parámetros 

**id:**      La id del establecimiento el cual queremos obtener la colección de establecimientos.
*obligatorio* 

**limit:**      El número de establecimientos que se quiere incluir en la colección (por defecto 5)
*opcional*

**after:**      El establecimeiento tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte establecimeiento  (hacia delante).
*opcional*

**before:**     El establecimeiento  tras el cual se quiere empezar a devolver la colección. La colección empezará después del establecimeiento  especificado (hacia atrás).
*opcional*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/establishments* 


#####Ejemplo del Resultado

```javascript
{
  "establishments": [
    {
      "id": 1,
      "name": "Gym A Tope",
      "desc": "Gimnasio perfecto para realizar tus actividades deportivas.",
      "city": "San Vicente del Raspeig",
      "province": "Alicante",
      "addr": "Calle San Franciso nº15",
      "phone": "965660327",
      "website": "http://wwww.gymatope.es",
      "main_img": "atope.jpeg",
      "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
      "createdAt": "2015-11-09T12:45:25.000Z",
      "updatedAt": "2015-11-09T12:45:25.000Z"
    },
    {
      "id": 2,
      "name": "Gym Noray",
      "desc": "Gimnasio muy acondicionado y en perfecto estado.",
      "city": "Santa Pola",
      "province": "Alicante",
      "addr": "Calle Falsa nº34",
      "phone": "965662347",
      "website": "http://wwww.noraygym.com",
      "main_img": "noray.jpeg",
      "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
      "createdAt": "2015-11-09T12:45:25.000Z",
      "updatedAt": "2015-11-09T12:45:25.000Z"
    },
    {
      "id": 3,
      "name": "Más Sport",
      "desc": "Asociación deportiva con unas instalaciones increíbles.",
      "city": "Valencia",
      "province": "Valencia",
      "addr": "Calle Arco nº32",
      "phone": "965663057",
      "website": "http://wwww.masport.es",
      "main_img": "mas.jpeg",
      "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
      "createdAt": "2015-11-09T12:45:25.000Z",
      "updatedAt": "2015-11-09T12:45:25.000Z"
    },
    {
      "id": 4,
      "name": "Montemar",
      "desc": "Especializados en cursos y clases de ténis.",
      "city": "Alicante",
      "province": "Alicante",
      "addr": "Avenida Novelda Km 14",
      "phone": "965662268",
      "website": "http://wwww.montemar.es",
      "main_img": "montemar.jpeg",
      "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
      "createdAt": "2015-11-09T12:45:25.000Z",
      "updatedAt": "2015-11-09T12:45:25.000Z"
    },
    {
      "id": 5,
      "name": "Gimnasio 13",
      "desc": "El mejor lugar para ponerte en forma.",
      "city": "Barcelona",
      "province": "Barcelona",
      "addr": "Gran Vía nº15",
      "phone": "965662257",
      "website": "http://wwww.13gym.es",
      "main_img": "13gym.jpeg",
      "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
      "createdAt": "2015-11-09T12:45:25.000Z",
      "updatedAt": "2015-11-09T12:45:25.000Z"
    }
  ],
  "paging": {
    "cursors": {
      "before": 0,
      "after": "NQ=="
    },
    "previous": "none",
    "next": "https://localhost:3000/api/establishments?after=NQ==&limit=5"
  },
  "links": {
    "rel": "self",
    "href": "https://localhost:3000/api/establishments"
  }
}
```

####GET api/establishments/:id

Obtiene la información del establecimiento especificado. Devuelve también la información pública del propietario del establecimiento.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/:id*

#####Parámetros 

**id:**      La id del establecimiento el cual queremos obtener la información.
*obligatorio* 

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/establishments/2* 


#####Ejemplo del Resultado

```javascript
{
  "id": 2,
  "name": "Gym Noray",
  "desc": "Gimnasio muy acondicionado y en perfecto estado.",
  "city": "Santa Pola",
  "province": "Alicante",
  "addr": "Calle Falsa nº34",
  "phone": "965662347",
  "website": "http://wwww.noraygym.com",
  "main_img": "noray.jpeg",
  "Owner": {
    "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
    "name": "Norman",
    "lname": "Coloma García",
    "email": "ua.norman@gmail.com",
    "gender": "male"
  },
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/establishments/2"
      },
      {
        "rel": "sports",
        "href": "https://localhost:3000/api/establishments/2/sports"
      }
    ]
  ]
}
```

####GET api/establishments/sports/:id/location/:location

Devuelve la colección de todos los establecimientos registrados en la API, filtrados por el deporte especificado, y la localización especificada.
También devuelve la id del curso asociado al deporte especificado.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/sports/:id/location/:location*

#####Parámetros 

**id:**      La id del deporte el cual queremos obtener la colección de establecimientos.
*obligatorio* 

**location:**      La ciudad o provincia de la cual queremos obtener la colección de establecimientos.
*obligatorio* 

**limit:**      El número de establecimientos que se quiere incluir en la colección (por defecto 5)
*opcional*

**after:**      El establecimeiento tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte establecimeiento  (hacia delante).
*opcional*

**before:**     El establecimeiento  tras el cual se quiere empezar a devolver la colección. La colección empezará después del establecimeiento  especificado (hacia atrás).
*opcional*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/establishments/sport/1/location/Alicante* 


#####Ejemplo del Resultado

```javascript
{
  "Establishments": {
    "count": 3,
    "rows": [
      {
        "id": 1,
        "name": "Gym A Tope",
        "desc": "Gimnasio perfecto para realizar tus actividades deportivas.",
        "city": "San Vicente del Raspeig",
        "province": "Alicante",
        "addr": "Calle San Franciso nº15",
        "phone": "965660327",
        "website": "http://wwww.gymatope.es",
        "main_img": "atope.jpeg",
        "Courses": [
          {
            "id": 1
          }
        ]
      },
      {
        "id": 2,
        "name": "Gym Noray",
        "desc": "Gimnasio muy acondicionado y en perfecto estado.",
        "city": "Santa Pola",
        "province": "Alicante",
        "addr": "Calle Falsa nº34",
        "phone": "965662347",
        "website": "http://wwww.noraygym.com",
        "main_img": "noray.jpeg",
        "Courses": [
          {
            "id": 4
          }
        ]
      },
      {
        "id": 4,
        "name": "Montemar",
        "desc": "Especializados en cursos y clases de ténis.",
        "city": "Alicante",
        "province": "Alicante",
        "addr": "Avenida Novelda Km 14",
        "phone": "965662268",
        "website": "http://wwww.montemar.es",
        "main_img": "montemar.jpeg",
        "Courses": [
          {
            "id": 5
          }
        ]
      }
    ]
  },
  "paging": {
    "cursors": {
      "before": 0,
      "after": 0
    },
    "previous": "none",
    "next": "none"
  },
  "links": {
    "rel": "self",
    "href": "https://localhost:3000/api/establishments/sport/1/location/Alicante"
  }
}
```

**_api/establishments/:id/sports (GET)_:** Recopila la información de todos los deportes que se imparten en el establecimiento especificado mediante la id.

####GET api/establishments/:id/sports/

Devuelve la colección de todos los deportes asociados al establecimiento que se especifica.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/:id/sports*

#####Parámetros 

**id:**      La id del establecimiento el cual queremos obtener la colección de deportes.
*obligatorio* 

**limit:**      El número de deportes que se quiere incluir en la colección (por defecto 5)
*opcional*

**after:**      El deporte tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte deporte  (hacia delante).
*opcional*

**before:**     El deporte tras el cual se quiere empezar a devolver la colección. La colección empezará después del deporte  especificado (hacia atrás).
*opcional*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/establishments/1/sports* 


#####Ejemplo del Resultado

```javascript
{
  "sports": [
    {
      "id": 1,
      "name": "Spinning"
    },
    {
      "id": 2,
      "name": "GAP"
    },
    {
      "id": 3,
      "name": "Body Jump"
    }
  ],
  "paging": {
    "cursors": {
      "before": 0,
      "after": 0
    },
    "previous": "none",
    "next": "none"
  },
  "links": {
    "rel": "self",
    "href": "https://localhost:3000/api/establishments/1/sports"
  }
}
```

####PUT api/establishments/:id

Modifica el establecimiento especificado mediante su id. Devolverá el estado 204 en caso de éxito. El usuario autenticado debe ser el propietario del 
establecimiento a modificar en cuestión.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/:id*

#####Parámetros 

**id:**      La id del establecimiento el cual queremos modificar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

UPDATE
*https://localhost:3000/api/establishments/1*

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

```javascript
{
    "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735", "desc" : "La descripción a cambiado"
}
```
En la petición se debe incluir la id del propietario. 

####DELETE api/establishments/:id

Elimina el establecimiento especificado mediante su id. Devuelve el estado 204 en caso de éxito de la operación. Se debe ser el propietario 
del establecimiento a eliminar en cuestión.

#####Ruta del Recurso

*https://localhost:3000/api/establishments/:id*

#####Parámetros 

**id:**      La id del establecimiento el cual queremos eliminar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

DELETE
*https://localhost:3000/api/establishments/9*

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

###Cursos

**_api/courses/new (POST)_:** 

####POST api/courses/new

Permite al usuario establecer un curso. Un curso está directamente relacionado con un establecimiento y un deporte. Por lo tanto
es obligatorio establecer la id del establecimiento en el cual se quiere impartir dicho curso, y el deporte del cual será el curso. 
Devolverá el recurso creado.

#####Ruta del Recurso

*https://localhost:3000/api/courses/new*


#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

POST
*https://localhost:3000/api/courses/new* 

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

```javascript
{
    "sportId" : 1, "establishmentId" : 1, "instrucotor" : "Juan Domínguez", 
    "price" : "20", "info" : "Un curso muy completo"
}
```

#####Ejemplo del Resultado

```javascript
{
  "id": 6,
  "sportId": 1,
  "establishmentId": 1,
  "price": "20",
  "info": "Un curso muy completo",
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/courses/new"
      },
      {
        "rel": "update",
        "href": "https://localhost:3000/api/courses/6"
      },
      {
        "rel": "delete",
        "href": "https://localhost:3000/api/courses/6"
      }
    ]
  ]
}
```

####GET api/courses/:id

Obtiene la información del curso especificado. Devuelve también la información del establecimiento al cual pertenece, 
y del deporte el cual trata el curso.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Parámetros 

**id:**      La id del curso el cual queremos obtener la información.
*obligatorio* 

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/courses/2* 


#####Ejemplo del Resultado

```javascript
{
  "id": 2,
  "Sport": {
    "id": 2,
    "name": "GAP"
  },
  "Establishment": {
    "id": 2,
    "name": "Gym Noray",
    "desc": "Gimnasio muy acondicionado y en perfecto estado.",
    "city": "Santa Pola",
    "province": "Alicante",
    "addr": "Calle Falsa nº34",
    "phone": "965662347",
    "website": "http://wwww.noraygym.com",
    "main_img": "noray.jpeg",
    "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735"
  },
  "instructor": "Pepe Castaño",
  "price": 20,
  "info": "Un curso no tan completo",
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/courses/2"
      },
      {
        "rel": "sports",
        "href": "https://localhost:3000/api/courses/2/schedule"
      }
    ]
  ]
}
```

####PUT api/courses/:id

Modifica el curso especificado mediante su id. Devolverá el estado 204 en caso de éxito. El usuario autenticado debe ser el propietario del 
establecimento en el cual se da el curso a modificar en cuestión.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Parámetros 

**id:**      La id del curso el cual queremos modificar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

UPDATE
*https://localhost:3000/api/courses/1*

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc

```javascript
{
    "info" : "El curso tiene mucho nivel"
}
```

####DELETE api/courses/:id

Elimina el curso especificado mediante su id. Devuelve el estado 204 en caso de éxito de la operación. Se debe ser el propietario 
del establecimiento en el cual se imparte el curso a eliminar en cuestión.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Parámetros 

**id:**      La id del curso el cual queremos eliminar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

DELETE
*https://localhost:3000/api/courses/9*

**Headers** 

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc






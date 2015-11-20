#JustSport 

JustSport es un aplicaicón diseñada para facilitar la difusión de los gimnasios, centros deportivos, y cualquier centro de dicho de ámbito.
Con ella podrás anunciarte y facilitar a los usuarios, toda la información relativa a las clases y actividades deportivas que ofertas. La 
aplicación expone su propia API Rest.

#Guía para desarrolladores 

A continuación, se proporcionará una pequeña guía para los desarrolladores y cualquier persona que quiera hacer uso de ella. JustSport está
en estado de desarollo, por lo que la documentación se irá actualizando a medida que se vayan incorporando nuevas caracterísitcas, o se sufran 
modificaciones.

##API

1. [Esquema](#esquema) 
2. [Paginación](#paginación)
3. [Autenticación](#autenticación) 
4. [Headers](#headers)
4. [Hipermedia](#hipermedia) 
5. [Errores](#errores) 
6. [Usuarios](#usuarios) 
7. [Clientes](#clientes)
8. [Deportes](#deportes) 
9. [Establecimientos](#establecimientos) 
10. [Cursos](#cursos) 
11. [Horario](#horario)


###Esquema 

Todo el acceso a la API se hace bajo HTTPS. Todos los datos son enviados y recibidos en formato JSON.

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

###Headers 

Puesto que la API requiere autenticación, como ya se ha comentado, se necesitará enviar en cada petición el header *Authorization*

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc


###Hipermedia 

Se ha provisto a la API de hipermedia, por lo que en el mayoría de endpoints, se puede ver como seguir interactuando con la API a partir de ese punto. 
La hipermedia aún está por especificar completamente, y sufrirá fuertes modificaciones. 

###Errores

Nos podemos encontrar ante los siguientes errores:

####Enviar un JSON con falta de campos. Devolverá una respuesta con código *400 Bad Request* 

Si enviamos un JSON con falta de campos, obtendremos el siguiente error, ajustado al tipo de recurso que hayamos intentado consumir:

```json
{
  "message": "Json is malformed, it must include the following fields: name, desc, city, province, addr, owner, phone, website(optional), main_img(optional)"
}
```

####Acceder a un recurso proporcionando una id no númerica. Devolverá una respuesta con código *400 Bad Request* 

Para los recursos, en los cuales se deba proporcionar la id, y esta no sea numérica, devolverá la siguiente respuesta: 

```json
{
  "message": "The supplied id that specifies the course is not a numercial id"
}
```

####Establecer el límite de la paginación a 0. Devolverá una respuesta con código *400 Bad Request* 

Al intentar acceder a una colección, podemos establecer el límite de la misma, si dicho límite es establecido a 0, devolverá la siguiente respuesta: 

```json
{
  "message": "The limit for pagination, must be greater than 0"
}
```

####Usar paginación con cursores sin establecer un límite para los mismos. Devolverá una respuesta con código *400 Bad Request* 

Al intentar acceder a una colección especificando los cursores, es obligatorio además, especificar el límite para los mismos. En caso de no hacerlo: 

```json
{
  "message": "Wrong parameters, limit parameter must be set for paging"
}
```

####Enviar una petición con autorización, sin tener permisos para dicho recurso. Devolverá una respuesta con código *403 Forbidden*

Ciertos recursos, solo pueden ser creados, modificados, o eliminados, por cuentas con privilegios elevados (propietarios), o por los propios creadores del recurso.

```json
{
  "message": "You are not authorized to perform this action"
}
```

####Errores relativos a operaciones no permitidas. Devolverá una respuesta con código *500 Internal Server Error*

En ocasiones podemos intentar realizar operaciones que no son posibles, como la creación de un recurso único (como podría ser un email). El envío de valores
no permitidos para un cierto campo (como podría ser enviar un literal en un campo de tipo integer). Intentar relacionar a un recurso, a otro que no existe. O
que la base de datos esté caída por cualquier problema en el servidor. Ante este tipo de errores, nos encontraremos con la siguiente respuesta: 

```json
{
  "errors": [
    {
      "type": "Validation failed",
      "field": "name",
      "message": "name must only contain letters"
    }
  ]
}
```

| Error                               | Descripción del error                                                                                                                         |
| ------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|
| Missing field                       | Significa que uno de los campos obligatorios, no está siendo enviado                                                                          |
| Validation failed                   | Significa que alguna validación para algún campo, no está pasando, puesto que no se está cumpliendo                                           |
| Duplicated entry                    | Significa que algún recurso existente, ya tiene establecido el valor único, que estamos intentado establecer a otro recurso                   |
| Inexistent reference                | Signfica que la referencia que estamos intentando establecer a un recurso a fallado, puesto que dicho recurso al que se referencia, no existe |
| Database down                       | Significa que la base de datos está caída temporalmente. Esto se debe a problemas internos con el servidor.


###Usuarios

Las cuentas de usuario pemitirán tener un nivel de privilegios distintos en función del grado de la cuenta, estas pueden ser: 

1. Usuario 
2. Propietario
3. Admin (No podrá ser creada)

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

```json
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

```json
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

```json
{
    "name" : "Second Client", "userId" : "26b408e3-b1bc-4afb-b85a-211269eb7815"
}
```

#####Ejemplo del Resultado

```json
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


#####Ejemplo del Resultado

```json
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

```json
{
    "name":"Pilates"
}
```

#####Ejemplo del Resultado

```json
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

```json
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

```json
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

```json
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

```json
{
  "name": "Body Jump",
}
```


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

```json
{
    "name":"Total Sport", "desc":"Total Sport es un gimnasio que ofrece las mejores condiciones para ponerte en forma",
    "city":"Alicante", "province":"Alicante", "addr":"Calle Alfonso el Sabio", "phone" :"965663030", 
    "owner" : "3a8a07f5-1f9e-404a-b098-094462f947c6"
}
```

#####Ejemplo del Resultado

```json
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

```json
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

```json
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

```json
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

```json
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

```json
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


###Cursos

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

```json
{
    "sportId" : 1, "establishmentId" : 1, "instrucotor" : "Juan Domínguez", 
    "price" : "20", "info" : "Un curso muy completo"
}
```

#####Ejemplo del Resultado

```json
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

```json
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
        "rel": "schedule",
        "href": "https://localhost:3000/api/courses/2/schedule"
      }
    ]
  ]
}
```

####GET api/courses/:id/schedule

Obtine el horario del curso especificado.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Parámetros 

**id:**      La id del curso el cual queremos obtener el horario.
*obligatorio* 

**limit:**      El número de horarios que se quiere incluir en la colección (por defecto 5)
*opcional*

**after:**      El horario tras el cual se quiere empezar a devolver la colección. La colección empezará después del horario especificado(hacia delante).
*opcional*

**before:**     El horario tras el cual se quiere empezar a devolver la colección. La colección empezará después del horario  especificado (hacia atrás).
*opcional*

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | Público       |

#####Ejemplo de Petición 

GET
*https://localhost:3000/api/courses/1/schedule* 


#####Ejemplo del Resultado

```json
{
  "Schedule": {
    "count": 6,
    "rows": [
      {
        "id": 1,
        "day": "Martes",
        "startTime": "10:00",
        "endTime": "11:00"
      },
      {
        "id": 2,
        "day": "Lunes",
        "startTime": "11:00",
        "endTime": "12:00"
      },
      {
        "id": 3,
        "day": "Miércoles",
        "startTime": "17:00",
        "endTime": "18:00"
      },
      {
        "id": 4,
        "day": "Jueves",
        "startTime": "12:00",
        "endTime": "13:00"
      },
      {
        "id": 5,
        "day": "Jueves",
        "startTime": "20:00",
        "endTime": "21:00"
      }
    ]
  },
  "paging": {
    "cursors": {
      "before": 0,
      "after": "NQ=="
    },
    "previous": "none",
    "next": "https://localhost:3000/api/courses/1/schedule?after=NQ==&limit=5"
  },
  "links": {
    "rel": "self",
    "href": "https://localhost:3000/api/courses/1/schedule"
  }
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

```json
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


###Horario

####POST api/schedules/new

Permite al usuario establecer un horario a un curso. Un horario está directamente relacionado con un curso. Devolverá el recurso creado.

#####Ruta del Recurso

*https://localhost:3000/api/schedules/new*


#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

POST
*https://localhost:3000/api/schedules/new* 

```json
{
    "day": "Martes", "startTime": "19:00", "endTime":"20:00", "courseId": 1
}
```

Es obligatorio enviar en el cuerpo de la petición, la id del curso al cual se va a establecer el horario.

#####Ejemplo del Resultado

```json
{
  "id": 7,
  "day": "Martes",
  "startTime": "19:00",
  "endTime": "20:00",
  "courseId": 1,
  "links": [
    [
      {
        "rel": "self",
        "href": "https://localhost:3000/api/schedules/new"
      },
      {
        "rel": "update",
        "href": "https://localhost:3000/api/schedules/7"
      },
      {
        "rel": "delete",
        "href": "https://localhost:3000/api/schedules/7"
      }
    ]
  ]
}
```


####PUT api/schedules/:id

Modifica el horario especificado mediante su id. Devolverá el estado 204 en caso de éxito. El usuario autenticado debe ser el propietario del 
establecimento en el cual se da el curso del que se quiere modificar el horario.

#####Ruta del Recurso

*https://localhost:3000/api/schedules/:id*

#####Parámetros 

**id:**      La id del horario el cual queremos modificar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

UPDATE
*https://localhost:3000/api/schedules/1*

```json
{
    "startTime": "19:30", "endTime":"20:30", "courseId": 1
}
```

Es obligatorio enviar en el cuerpo de la petición, la id del curso al cual se va a actualizar el horario.

####DELETE api/schedules/:id

Elimina el horario especificado mediante su id. Devuelve el estado 204 en caso de éxito de la operación. Se debe ser el propietario 
del establecimiento en el cual se imparte el curso del que se quiere eliminar el horario.

#####Ruta del Recurso

*https://localhost:3000/api/schedules/:id*

#####Parámetros 

**id:**      La id del horario el cual queremos eliminar.
*obligatorio*  

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | Sí            | Propietario   |

#####Ejemplo de Petición 

DELETE
*https://localhost:3000/api/schedules/9*

```json
{
    "courseId": 1
}
```

Es obligatorio enviar en el cuerpo de la petición, la id del curso al cual se va a eliminar el horario.







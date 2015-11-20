#JustSport 

JustSport es un aplicaic�n dise�ada para facilitar la difusi�n de los gimnasios, centros deportivos, y cualquier centro de dicho de �mbito.
Con ella podr�s anunciarte y facilitar a los usuarios, toda la informaci�n relativa a las clases y actividades deportivas que ofertas. La 
aplicaci�n expone su propia API Rest.

#Gu�a para desarrolladores 

A continuaci�n, se proporcionar� una peque�a gu�a para los desarrolladores y cualquier persona que quiera hacer uso de ella. JustSport est�
en estado de desarollo, por lo que la documentaci�n se ir� actualizando a medida que se vayan incorporando nuevas caracter�sitcas, o se sufran 
modificaciones.

##API

1. [Esquema](#esquema) 
2. [Paginaci�n](#paginaci�n)
3. [Autenticaci�n](#autenticaci�n) 
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

###Paginaci�n 

Todos los endpoints que apunten a la recopilaci�n de colecciones, hacen uso de paginaci�n mediante cursores. Por defecto, la paginaci�n est� limitada a 5 elementos, pero 
se puede establecer el n�mero que se crea conveniente:  

**_api/sports?limit=2:_** Mediante el par�metro limit, se establece el l�mite de la paginaci�n. 

El uso de los cursores ser� de la siguiente forma: 

**_api/sports?after=Mg==&limit=2:_** Mediante el par�metro after, se especifica, que la informaci�n de la colecci�n, comenzar� tras el elemento "after".

**_api/sports?before=Mg==&limit=2:_** Mediante el par�metro before, se especifica, que la informaci�n de la colecci�n, comenzar� tras el elemento "before".

###Autenticaci�n 

Muchas de las rutas est�n protegidas. La autenticaci�n de la aplicaci�n se maneja mediante OAuth2. Es las pr�ximas versiones se especificar� como hacer 
uso de la autenticaci�n en m�s detalle. 

Por el momento, y tras estar registrado, basta con hacer una petici�n al siguiente endpoint: 

**_/api/oauth2/token?username=ua.norman@gmail.com&password=norman2015&grant_type=password&client_id=2xa001za-78b3-4f38-9376-e2dd88b7c682_**

El par�metro "client_id" no es un par�metro obligatorio, pero por defecto, en caso de usarlo, se usar� el del cliente oficial (el cual est� indicado en el ejemplo).
La API REST corre sobre el protocolo HTTPS, por lo que no se ha de ser temeroso a la hora de introducir el usuario y password en la aplicaci�n oficial.

###Headers 

Puesto que la API requiere autenticaci�n, como ya se ha comentado, se necesitar� enviar en cada petici�n el header *Authorization*

*Authorization* 
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNmI0MDhlMy1iMWJjLTRhZmItYjg1YS0yMTEyNjllYjc4MTUiLCJleHAiOjE0NDc3NTQyNDE1MzIsInJvbGUiOiJvd25lciJ9.8VkHV8Q5pW0aJRJyTdMJ0dHn2zj7jWb7WIwDsq1xeNc


###Hipermedia 

Se ha provisto a la API de hipermedia, por lo que en el mayor�a de endpoints, se puede ver como seguir interactuando con la API a partir de ese punto. 
La hipermedia a�n est� por especificar completamente, y sufrir� fuertes modificaciones. 

###Errores

Nos podemos encontrar ante los siguientes errores:

####Enviar un JSON con falta de campos. Devolver� una respuesta con c�digo *400 Bad Request* 

Si enviamos un JSON con falta de campos, obtendremos el siguiente error, ajustado al tipo de recurso que hayamos intentado consumir:

```json
{
  "message": "Json is malformed, it must include the following fields: name, desc, city, province, addr, owner, phone, website(optional), main_img(optional)"
}
```

####Acceder a un recurso proporcionando una id no n�merica. Devolver� una respuesta con c�digo *400 Bad Request* 

Para los recursos, en los cuales se deba proporcionar la id, y esta no sea num�rica, devolver� la siguiente respuesta: 

```json
{
  "message": "The supplied id that specifies the course is not a numercial id"
}
```

####Establecer el l�mite de la paginaci�n a 0. Devolver� una respuesta con c�digo *400 Bad Request* 

Al intentar acceder a una colecci�n, podemos establecer el l�mite de la misma, si dicho l�mite es establecido a 0, devolver� la siguiente respuesta: 

```json
{
  "message": "The limit for pagination, must be greater than 0"
}
```

####Usar paginaci�n con cursores sin establecer un l�mite para los mismos. Devolver� una respuesta con c�digo *400 Bad Request* 

Al intentar acceder a una colecci�n especificando los cursores, es obligatorio adem�s, especificar el l�mite para los mismos. En caso de no hacerlo: 

```json
{
  "message": "Wrong parameters, limit parameter must be set for paging"
}
```

####Enviar una petici�n con autorizaci�n, sin tener permisos para dicho recurso. Devolver� una respuesta con c�digo *403 Forbidden*

Ciertos recursos, solo pueden ser creados, modificados, o eliminados, por cuentas con privilegios elevados (propietarios), o por los propios creadores del recurso.

```json
{
  "message": "You are not authorized to perform this action"
}
```

####Errores relativos a operaciones no permitidas. Devolver� una respuesta con c�digo *500 Internal Server Error*

En ocasiones podemos intentar realizar operaciones que no son posibles, como la creaci�n de un recurso �nico (como podr�a ser un email). El env�o de valores
no permitidos para un cierto campo (como podr�a ser enviar un literal en un campo de tipo integer). Intentar relacionar a un recurso, a otro que no existe. O
que la base de datos est� ca�da por cualquier problema en el servidor. Ante este tipo de errores, nos encontraremos con la siguiente respuesta: 

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

| Error                               | Descripci�n del error                                                                                                                         |
| ------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|
| Missing field                       | Significa que uno de los campos obligatorios, no est� siendo enviado                                                                          |
| Validation failed                   | Significa que alguna validaci�n para alg�n campo, no est� pasando, puesto que no se est� cumpliendo                                           |
| Duplicated entry                    | Significa que alg�n recurso existente, ya tiene establecido el valor �nico, que estamos intentado establecer a otro recurso                   |
| Inexistent reference                | Signfica que la referencia que estamos intentando establecer a un recurso a fallado, puesto que dicho recurso al que se referencia, no existe |
| Database down                       | Significa que la base de datos est� ca�da temporalmente. Esto se debe a problemas internos con el servidor.


###Usuarios

Las cuentas de usuario pemitir�n tener un nivel de privilegios distintos en funci�n del grado de la cuenta, estas pueden ser: 

1. Usuario 
2. Propietario
3. Admin (No podr� ser creada)

####POST api/users/new

Permite al usuario registrarse. Por defecto los usuarios ser�n del tipo "usuario". Pero este valor se puede establecer tambi�n a
"owner" para conseguir los privilegios que este rol otorga. El campo que establece el nivel de privilegios es "role". Devuelve el usuario 
creado si ha la operaci�n ha tenido �xito. 

#####Ruta del Recurso

*https://localhost:3000/api/users/new*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | P�blico   |


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

Obtiene la informaci�n del usuario especificado. 

#####Ruta del Recurso

*https://localhost:3000/api/users/:id*

#####Par�metros 

**id:**      La id del usuario el cual queremos obtener la informaci�n.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | P�blico   |


#####Ejemplo de Petici�n 

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

El password del usuario se preserva, y no se incluye en la respuesta (aunque sea este el que est� realizando la petici�n)

####DELETE api/users/:id

Permite al usuario dar de baja su cuenta. Se requiere ser el propietario de la cuenta a eliminar en cuesti�n. Devuelve el 
estado 204 en caso de �xito de la operaci�n.

#####Ruta del Recurso

*https://localhost:3000/api/users/:id*

#####Par�metros 

**id:**      La id del usuario el cual queremos obtener la informaci�n.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | P�blico   |

#####Ejemplo de Petici�n 

DELETE 
*https://localhost:3000/api/users/26b408e3-b1bc-4afb-b85a-211269eb7815*



###Clientes

Los clientes son necesarios para poder hacer uso de la API desde una aplicaci�n externa a la oficial. Necesitar�s estar registrado en la misma, antes
de poder crear un Cliente.

####POST api/clients/new

Crea un nuevo cliente asociado a un usuario. Este cliente es �nico. Devolver� la informaci�n del cliente creado.

#####Ruta del Recurso

*https://localhost:3000/api/clients/new*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | S�            | Usuario   |

#####Ejemplo de Petici�n 

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

Devuelve una colecci�n de los clientes que pertenecen al usuario

#####Ruta del Recurso

*https://localhost:3000/api/clients/:user_id*

#####Par�metros 

**user_id:**      La id del usuario del cual se quiere obtener la colecci�n de clientes.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | S�            | Usuario   |

#####Ejemplo de Petici�n 

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

Permite al usuario registrar un nuevo deporte. Este no va vinculado de forma directa a ning�n establecimiento, ya que los deportes 
poseen muchos establecimientos y viceversa. Se establece una relaci�n N:M entre ellos. Devolver� el recurso creado.

#####Ruta del Recurso

*https://localhost:3000/api/sports/new*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

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

Devuelve la colecci�n de todos los deportes registrados en la API.

#####Ruta del Recurso

*https://localhost:3000/api/sports/*

#####Par�metros 

**limit:**      El n�mero de deportes que se quiere incluir en la colecci�n (por defecto 5)
*opcional*

**after:**      El deporte tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte especificado (hacia delante).
*opcional*

**before:**     El deporte tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte especificado (hacia atr�s).
*opcional*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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

Devuelve la informaci�n del deporte especificado.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id*

#####Par�metros 

**id:**      La id del deporte el cual queremos obtener la informaci�n.

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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

Devuelve la colecci�n de todos los establecimientos, los cuales tienen asociados dicho deporte. De cada establecimiento, se devolver� tambi�n
la informaci�n p�blica de su propietario.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id/establishemnts*

#####Par�metros 

**id:**      La id del deporte el cual queremos obtener la colecci�n de establecimientos.
*obligatorio* 

**limit:**      El n�mero de establecimientos que se quiere incluir en la colecci�n (por defecto 5)
*opcional*

**after:**      El deporte tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte especificado (hacia delante).
*opcional*

**before:**     El deporte tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte especificado (hacia atr�s).
*opcional*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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
      "addr": "Calle San Franciso n�15",
      "phone": "965660327",
      "website": "http://wwww.gymatope.es",
      "main_img": "atope.jpeg",
      "Owner": {
        "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
        "name": "Norman",
        "lname": "Coloma Garc�a",
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
      "addr": "Calle Falsa n�34",
      "phone": "965662347",
      "website": "http://wwww.noraygym.com",
      "main_img": "noray.jpeg",
      "Owner": {
        "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
        "name": "Norman",
        "lname": "Coloma Garc�a",
        "email": "ua.norman@gmail.com",
        "gender": "male"
      }
    },
    {
      "id": 4,
      "name": "Montemar",
      "desc": "Especializados en cursos y clases de t�nis.",
      "city": "Alicante",
      "province": "Alicante",
      "addr": "Avenida Novelda Km 14",
      "phone": "965662268",
      "website": "http://wwww.montemar.es",
      "main_img": "montemar.jpeg",
      "Owner": {
        "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
        "name": "Norman",
        "lname": "Coloma Garc�a",
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

Actualiza la informaci�n del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario. Devuelve el 
estado 204 en caso de �xito de la operaci�n.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id*

#####Par�metros 

**id:**      La id del deporte el cual queremos modificar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

PUT
*https://localhost:3000/api/sports/3*

```json
{
  "name": "Body Jump",
}
```


####DELETE api/sports/:id

Elimina el deporte especificado mediante su id. Con intenci�n de que no se puedan llevar a cabo acciones malintencionadas, y que cualquier usuario
con privilegios de propietario pueda eliminar un deporte (ya que recordemos que los deportes no pertenecen a ning�n usuario espec�fico), esta operaci�n
solo est� permitida a usuarios con privilegios de administrador Devuelve el estado 204 en caso de �xito de la operaci�n.

#####Ruta del Recurso

*https://localhost:3000/api/sports/:id*

#####Par�metros 

**id:**      La id del deporte el cual queremos modificar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Administrador |

#####Ejemplo de Petici�n 

DELETE
*https://localhost:3000/api/sports/3*


###Establecimientos

####POST api/establishments/new

Permite al usuario registrar un nuevo establecimeinto. Un establecimiento posee muchos deportes, pero recordamos que la relaci�n
entre ambos es N:M, de forma que un establecimiento contendr� muchos deportes, pero un deporte pertenecer� a m�s de un establecimiento. Con esto se pretende conseguir
una mayor coperaci�n por parte de los clientes que hagan uso de la API. Devolver� el establecimiento creado en caso de �xito.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/new*


#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

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

Devuelve la colecci�n de todos los establecimientos, registrados en la API.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts*

#####Par�metros 

**id:**      La id del establecimiento el cual queremos obtener la colecci�n de establecimientos.
*obligatorio* 

**limit:**      El n�mero de establecimientos que se quiere incluir en la colecci�n (por defecto 5)
*opcional*

**after:**      El establecimeiento tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte establecimeiento  (hacia delante).
*opcional*

**before:**     El establecimeiento  tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del establecimeiento  especificado (hacia atr�s).
*opcional*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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
      "addr": "Calle San Franciso n�15",
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
      "addr": "Calle Falsa n�34",
      "phone": "965662347",
      "website": "http://wwww.noraygym.com",
      "main_img": "noray.jpeg",
      "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
      "createdAt": "2015-11-09T12:45:25.000Z",
      "updatedAt": "2015-11-09T12:45:25.000Z"
    },
    {
      "id": 3,
      "name": "M�s Sport",
      "desc": "Asociaci�n deportiva con unas instalaciones incre�bles.",
      "city": "Valencia",
      "province": "Valencia",
      "addr": "Calle Arco n�32",
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
      "desc": "Especializados en cursos y clases de t�nis.",
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
      "addr": "Gran V�a n�15",
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

Obtiene la informaci�n del establecimiento especificado. Devuelve tambi�n la informaci�n p�blica del propietario del establecimiento.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/:id*

#####Par�metros 

**id:**      La id del establecimiento el cual queremos obtener la informaci�n.
*obligatorio* 

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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
  "addr": "Calle Falsa n�34",
  "phone": "965662347",
  "website": "http://wwww.noraygym.com",
  "main_img": "noray.jpeg",
  "Owner": {
    "uuid": "8a74a3aa-757d-46f1-ba86-a56a0f107735",
    "name": "Norman",
    "lname": "Coloma Garc�a",
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

Devuelve la colecci�n de todos los establecimientos registrados en la API, filtrados por el deporte especificado, y la localizaci�n especificada.
Tambi�n devuelve la id del curso asociado al deporte especificado.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/sports/:id/location/:location*

#####Par�metros 

**id:**      La id del deporte el cual queremos obtener la colecci�n de establecimientos.
*obligatorio* 

**location:**      La ciudad o provincia de la cual queremos obtener la colecci�n de establecimientos.
*obligatorio* 

**limit:**      El n�mero de establecimientos que se quiere incluir en la colecci�n (por defecto 5)
*opcional*

**after:**      El establecimeiento tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte establecimeiento  (hacia delante).
*opcional*

**before:**     El establecimeiento  tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del establecimeiento  especificado (hacia atr�s).
*opcional*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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
        "addr": "Calle San Franciso n�15",
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
        "addr": "Calle Falsa n�34",
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
        "desc": "Especializados en cursos y clases de t�nis.",
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

**_api/establishments/:id/sports (GET)_:** Recopila la informaci�n de todos los deportes que se imparten en el establecimiento especificado mediante la id.

####GET api/establishments/:id/sports/

Devuelve la colecci�n de todos los deportes asociados al establecimiento que se especifica.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/:id/sports*

#####Par�metros 

**id:**      La id del establecimiento el cual queremos obtener la colecci�n de deportes.
*obligatorio* 

**limit:**      El n�mero de deportes que se quiere incluir en la colecci�n (por defecto 5)
*opcional*

**after:**      El deporte tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte deporte  (hacia delante).
*opcional*

**before:**     El deporte tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del deporte  especificado (hacia atr�s).
*opcional*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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

Modifica el establecimiento especificado mediante su id. Devolver� el estado 204 en caso de �xito. El usuario autenticado debe ser el propietario del 
establecimiento a modificar en cuesti�n.

#####Ruta del Recurso

*https://localhost:3000/api/establishemnts/:id*

#####Par�metros 

**id:**      La id del establecimiento el cual queremos modificar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

UPDATE
*https://localhost:3000/api/establishments/1*

```json
{
    "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735", "desc" : "La descripci�n a cambiado"
}
```
En la petici�n se debe incluir la id del propietario. 

####DELETE api/establishments/:id

Elimina el establecimiento especificado mediante su id. Devuelve el estado 204 en caso de �xito de la operaci�n. Se debe ser el propietario 
del establecimiento a eliminar en cuesti�n.

#####Ruta del Recurso

*https://localhost:3000/api/establishments/:id*

#####Par�metros 

**id:**      La id del establecimiento el cual queremos eliminar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

DELETE
*https://localhost:3000/api/establishments/9*


###Cursos

####POST api/courses/new

Permite al usuario establecer un curso. Un curso est� directamente relacionado con un establecimiento y un deporte. Por lo tanto
es obligatorio establecer la id del establecimiento en el cual se quiere impartir dicho curso, y el deporte del cual ser� el curso. 
Devolver� el recurso creado.

#####Ruta del Recurso

*https://localhost:3000/api/courses/new*


#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

POST
*https://localhost:3000/api/courses/new* 

```json
{
    "sportId" : 1, "establishmentId" : 1, "instrucotor" : "Juan Dom�nguez", 
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

Obtiene la informaci�n del curso especificado. Devuelve tambi�n la informaci�n del establecimiento al cual pertenece, 
y del deporte el cual trata el curso.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Par�metros 

**id:**      La id del curso el cual queremos obtener la informaci�n.
*obligatorio* 

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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
    "addr": "Calle Falsa n�34",
    "phone": "965662347",
    "website": "http://wwww.noraygym.com",
    "main_img": "noray.jpeg",
    "owner": "8a74a3aa-757d-46f1-ba86-a56a0f107735"
  },
  "instructor": "Pepe Casta�o",
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

#####Par�metros 

**id:**      La id del curso el cual queremos obtener el horario.
*obligatorio* 

**limit:**      El n�mero de horarios que se quiere incluir en la colecci�n (por defecto 5)
*opcional*

**after:**      El horario tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del horario especificado(hacia delante).
*opcional*

**before:**     El horario tras el cual se quiere empezar a devolver la colecci�n. La colecci�n empezar� despu�s del horario  especificado (hacia atr�s).
*opcional*

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | No            | P�blico       |

#####Ejemplo de Petici�n 

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
        "day": "Mi�rcoles",
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

Modifica el curso especificado mediante su id. Devolver� el estado 204 en caso de �xito. El usuario autenticado debe ser el propietario del 
establecimento en el cual se da el curso a modificar en cuesti�n.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Par�metros 

**id:**      La id del curso el cual queremos modificar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

UPDATE
*https://localhost:3000/api/courses/1*

```json
{
    "info" : "El curso tiene mucho nivel"
}
```

####DELETE api/courses/:id

Elimina el curso especificado mediante su id. Devuelve el estado 204 en caso de �xito de la operaci�n. Se debe ser el propietario 
del establecimiento en el cual se imparte el curso a eliminar en cuesti�n.

#####Ruta del Recurso

*https://localhost:3000/api/courses/:id*

#####Par�metros 

**id:**      La id del curso el cual queremos eliminar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

DELETE
*https://localhost:3000/api/courses/9*


###Horario

####POST api/schedules/new

Permite al usuario establecer un horario a un curso. Un horario est� directamente relacionado con un curso. Devolver� el recurso creado.

#####Ruta del Recurso

*https://localhost:3000/api/schedules/new*


#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

POST
*https://localhost:3000/api/schedules/new* 

```json
{
    "day": "Martes", "startTime": "19:00", "endTime":"20:00", "courseId": 1
}
```

Es obligatorio enviar en el cuerpo de la petici�n, la id del curso al cual se va a establecer el horario.

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

Modifica el horario especificado mediante su id. Devolver� el estado 204 en caso de �xito. El usuario autenticado debe ser el propietario del 
establecimento en el cual se da el curso del que se quiere modificar el horario.

#####Ruta del Recurso

*https://localhost:3000/api/schedules/:id*

#####Par�metros 

**id:**      La id del horario el cual queremos modificar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

UPDATE
*https://localhost:3000/api/schedules/1*

```json
{
    "startTime": "19:30", "endTime":"20:30", "courseId": 1
}
```

Es obligatorio enviar en el cuerpo de la petici�n, la id del curso al cual se va a actualizar el horario.

####DELETE api/schedules/:id

Elimina el horario especificado mediante su id. Devuelve el estado 204 en caso de �xito de la operaci�n. Se debe ser el propietario 
del establecimiento en el cual se imparte el curso del que se quiere eliminar el horario.

#####Ruta del Recurso

*https://localhost:3000/api/schedules/:id*

#####Par�metros 

**id:**      La id del horario el cual queremos eliminar.
*obligatorio*  

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol           |
| ---------------------|:-------------:| :------------:|
| JSON                 | S�            | Propietario   |

#####Ejemplo de Petici�n 

DELETE
*https://localhost:3000/api/schedules/9*

```json
{
    "courseId": 1
}
```

Es obligatorio enviar en el cuerpo de la petici�n, la id del curso al cual se va a eliminar el horario.







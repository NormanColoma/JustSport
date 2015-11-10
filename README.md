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

__https://localhost:3000/api/users/new__

#####Información del Recurso

| Formato de Respuesta | Autenticación | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | Público   |

#####Parámetros 

**name:**      El del usuario.
*obligatorio*  
     
**lname:**     Los apellidos del usuario. 
*obligatorio*  

**email:**     El email que el usuario usará para autenticarse. 
*obligatorio*  

**pass:**      La contraseña que el usuario usará para autenticarse.
*obligatorio*  

**gender:**    El sexo del usuario. 
*obligatorio*  

**role:**      El nivel de privilegios que tendrá el usuario (por defecto se establecer a "user"). 
*opcional*

#####Ejemplo del Resultado


**_api/users/:id (GET)_:** Recopila la información del usuario mediante su id (excepto la contraseña, la cual se mantiene en secreto por razones de seguridad).

**_api/users/:id (DELETE)_:** Permite al usuario dar de baja su cuenta. Se requiere ser el propietario de la cuenta a eliminar en cuestión.

###Clientes

Los clientes son necesarios para poder hacer uso de la API desde una aplicación externa a la oficial. Necesitarás estar registrado en la misma, antes
de poder crear un Cliente.

**_api/clients/new (POST)_:** Permite crear un nuevo cliente.

**_api/clients/:id_user (GET)_:** Recopila la información de todos los clientes en posesión del usuario especificado.


###Deportes

**_api/sports/new (POST)_:** Permite al usuario registrar un nuevo deporte. Este no va vinculado de forma directa a ningún establecimiento, ya que los deportes 
poseen muchos establecimientos y viceversa. Se establece una relación N:M entre ellos. Se requiere una cuenta con un nivel de propietario.

**_api/sports/ (GET)_:** Recopila la información de todos los deportes.

**_api/sports/:id (GET)_:** Recopila la información del deporte especificado mediante su id.

**_api/sports/:id/establishments (GET)_:** Recopila la información de todos los establecimientos que imparten el deporte especificado mendiante la id.

**_api/sports/:id (PUT)_:** Actualiza la información del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

**_api/sports/:id (Delete)_:** Permite la eliminación del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

###Establecimientos

**_api/establishments/new (POST)_:** Permite al usuario registrar un nuevo establecimeinto. Un establecimiento posee muchos deportes, pero recordamos que la relación
entre ambos es N:M, de forma que un establecimiento contendrá muchos deportes, pero un deporte pertenecerá a más de un establecimiento. Con esto se pretende conseguir
una mayor coperación por parte de los clientes que hagan uso de la API. Se requiere una cuenta con un nivel de propietario. Se requiere una cuenta con un nivel de propietario.

**_api/establishments/ (GET)_:** Recopila información de todos los establecimientos registrados en la API.

**_api/establishment/:id (GET)_:** Recopila la información del establecimiento mediante su id. También recopila la información de su propietario (el usuario que lo registró),
ya que existe una relación directa entre ambos, puesto que un establecimiento pertenece a un usuario. 

**_api/establishment/sports/:id/location/:location (GET)_:** Recopila la información de todos los establecimientos filtrados por el deporte especificado, y la ubicación (esta puede ser o bien la ciudad o la provincia) 
que se desee buscar. 

**_api/establishments/:id/sports (GET)_:** Recopila la información de todos los deportes que se imparten en el establecimiento especificado mediante la id.

**_api/establishments/:id (PUT)_:** Actualiza la información del establecimiento especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

**_api/sports/:id (Delete)_:** Permite la eliminación del establecimiento especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

###Cursos

**_api/courses/new (POST)_:** Permite al usuario establecer un curso. Un curso está directamente relacionado con un establecimiento y un deporte. Por lo tanto
es obligatorio establecer la id del establecimiento en el cual se quiere impartir dicho curso, y el deporte del cual será el curso. 

**_api/courses/:id (GET)_:** Recopila información del curso especificado mediante su id. También recopila la información del tipo de deporte que es el curso,
y del establecimiento en el que se da dicho curso.

**_api/courses/:id (PUT)_:** Actualiza la información de un curso especificado mediante su id.

**_api/courses/:id (Delete)_:** Permite la eliminación de un curso especificado mediante su id.





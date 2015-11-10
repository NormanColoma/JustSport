#JustSport 

JustSport es un aplicaic�n dise�ada para facilitar la difusi�n de los gimnasios, centros deportivos, y cualquier centro de dicho de �mbito.
Con ella podr�s anunciarte y facilitar a los usuarios, toda la informaci�n relativa a las clases y actividades deportivas que ofertas. La 
aplicaci�n expone su propia API Rest.

#Gu�a para desarrolladores 

A continuaci�n, se proporcionar� una peque�a gu�a para los desarrolladores y cualquier persona que quiera hacer uso de ella. JustSport est�
en estado de desarollo, por lo que la documentaci�n se ir� actualizando a medida que se vayan incorporando nuevas caracter�sitcas, o se sufran 
modificaciones.

##API

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

###Hipermedia 

Se ha provisto a la API de hipermedia, por lo que en el mayor�a de endpoints, se puede ver como seguir interactuando con la API a partir de ese punto. 
La hipermedia a�n est� por especificar completamente, y sufrir� fuertes modificaciones. 

###Endpoints 

| Ruta          	                                     | M�todo      |      Rol     |
| -------------------------------------------------------|:-----------:|:------------:|
| api/users/new                                          | POST        |  Propietario |
| api/users/:id                                          | GET         |  P�blico     |
| api/users/:id                                          | DELETE      |  Usuario     |
| api/clients/new                                        | POST        |  Propietario | 
| api/clients/:id_user                                   | GET         |  Propietario | 
| api/sports/new                                         | POST        |  Propietario | 
| api/sports/                                            | GET         |  P�blico     | 
| api/sports/:id/establishments                          | GET         |  P�blico     |
| api/sports/:id                                         | PUT         |  Propietario | 
| api/sports/:id                                         | DELETE      |  Admin       | 
| api/establishments/new                                 | POST        |  Propietario | 
| api/establishments/                                    | GET         |  P�blico     | 
| api/establishments/:id                                 | GET         |  P�blico     | 
| api/establishments/:id/sports                          | GET         |  P�blico     | 
| api/establishment/sports/:id/location/:location        | GET         |  P�blico     | 
| api/establishments/:id                                 | PUT         |  Propietario | 
| api/establishments/:id                                 | DELETE      |  Propietario |
| api/courses/new                                        | POST        |  Propietario | 
| api/courses/:id                                        | GET         |  P�blico     | 
| api/courses/:id                                        | PUT         |  Propietario | 
| api/courses/:id                                        | DELETE      |  Propietario |

###Usuarios

####POST api/users/new

Permite al usuario registrarse. Por defecto los usuarios ser�n del tipo "usuario". Pero este valor se puede establecer tambi�n a
"owner" para conseguir los privilegios que este rol otorga. El campo que establece el nivel de privilegios es "role". Devuelve el usuario 
creado si ha la operaci�n ha tenido �xito. 

#####Ruta del Recurso

__https://localhost:3000/api/users/new__

#####Informaci�n del Recurso

| Formato de Respuesta | Autenticaci�n | Rol       |
| ---------------------|:-------------:| :--------:|
| JSON                 | No            | P�blico   |

#####Par�metros 

**name:**      El del usuario.
*obligatorio*  
     
**lname:**     Los apellidos del usuario. 
*obligatorio*  

**email:**     El email que el usuario usar� para autenticarse. 
*obligatorio*  

**pass:**      La contrase�a que el usuario usar� para autenticarse.
*obligatorio*  

**gender:**    El sexo del usuario. 
*obligatorio*  

**role:**      El nivel de privilegios que tendr� el usuario (por defecto se establecer a "user"). 
*opcional*

#####Ejemplo del Resultado


**_api/users/:id (GET)_:** Recopila la informaci�n del usuario mediante su id (excepto la contrase�a, la cual se mantiene en secreto por razones de seguridad).

**_api/users/:id (DELETE)_:** Permite al usuario dar de baja su cuenta. Se requiere ser el propietario de la cuenta a eliminar en cuesti�n.

###Clientes

Los clientes son necesarios para poder hacer uso de la API desde una aplicaci�n externa a la oficial. Necesitar�s estar registrado en la misma, antes
de poder crear un Cliente.

**_api/clients/new (POST)_:** Permite crear un nuevo cliente.

**_api/clients/:id_user (GET)_:** Recopila la informaci�n de todos los clientes en posesi�n del usuario especificado.


###Deportes

**_api/sports/new (POST)_:** Permite al usuario registrar un nuevo deporte. Este no va vinculado de forma directa a ning�n establecimiento, ya que los deportes 
poseen muchos establecimientos y viceversa. Se establece una relaci�n N:M entre ellos. Se requiere una cuenta con un nivel de propietario.

**_api/sports/ (GET)_:** Recopila la informaci�n de todos los deportes.

**_api/sports/:id (GET)_:** Recopila la informaci�n del deporte especificado mediante su id.

**_api/sports/:id/establishments (GET)_:** Recopila la informaci�n de todos los establecimientos que imparten el deporte especificado mendiante la id.

**_api/sports/:id (PUT)_:** Actualiza la informaci�n del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

**_api/sports/:id (Delete)_:** Permite la eliminaci�n del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

###Establecimientos

**_api/establishments/new (POST)_:** Permite al usuario registrar un nuevo establecimeinto. Un establecimiento posee muchos deportes, pero recordamos que la relaci�n
entre ambos es N:M, de forma que un establecimiento contendr� muchos deportes, pero un deporte pertenecer� a m�s de un establecimiento. Con esto se pretende conseguir
una mayor coperaci�n por parte de los clientes que hagan uso de la API. Se requiere una cuenta con un nivel de propietario. Se requiere una cuenta con un nivel de propietario.

**_api/establishments/ (GET)_:** Recopila informaci�n de todos los establecimientos registrados en la API.

**_api/establishment/:id (GET)_:** Recopila la informaci�n del establecimiento mediante su id. Tambi�n recopila la informaci�n de su propietario (el usuario que lo registr�),
ya que existe una relaci�n directa entre ambos, puesto que un establecimiento pertenece a un usuario. 

**_api/establishment/sports/:id/location/:location (GET)_:** Recopila la informaci�n de todos los establecimientos filtrados por el deporte especificado, y la ubicaci�n (esta puede ser o bien la ciudad o la provincia) 
que se desee buscar. 

**_api/establishments/:id/sports (GET)_:** Recopila la informaci�n de todos los deportes que se imparten en el establecimiento especificado mediante la id.

**_api/establishments/:id (PUT)_:** Actualiza la informaci�n del establecimiento especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

**_api/sports/:id (Delete)_:** Permite la eliminaci�n del establecimiento especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

###Cursos

**_api/courses/new (POST)_:** Permite al usuario establecer un curso. Un curso est� directamente relacionado con un establecimiento y un deporte. Por lo tanto
es obligatorio establecer la id del establecimiento en el cual se quiere impartir dicho curso, y el deporte del cual ser� el curso. 

**_api/courses/:id (GET)_:** Recopila informaci�n del curso especificado mediante su id. Tambi�n recopila la informaci�n del tipo de deporte que es el curso,
y del establecimiento en el que se da dicho curso.

**_api/courses/:id (PUT)_:** Actualiza la informaci�n de un curso especificado mediante su id.

**_api/courses/:id (Delete)_:** Permite la eliminaci�n de un curso especificado mediante su id.





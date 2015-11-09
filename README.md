#JustSport 

JustSport es un API Rest diseñada para facilitar la difusión de los gimnasios, centros deportivos, y cualquier centro de dicho de ámbito.
Con ella podrás anunciarte y facilitar a los usuarios, toda la información relativa a las clases y actividades deportivas que ofertas. 

#Guía para desarrolladores 

A continuación, se proporcionará una pequeña guía para los desarrolladores y cualquier persona que quiera hacer uso de ella. 

##Endpoints 

######Usuarios

**_api/users/new (POST)_:** Permite al usuario registrarse. Por defecto los usuarios serán del tipo "usuario". Pero este valor se puede establecer también a
"owner" para conseguir los privilegios que este rol otorga. El campo que establece el nivel de privilegios es "role". 

**_api/users/:id (GET)_:** Recopila la información del usuario mediante su id (excepto la contraseña, la cual se mantiene en secreto por razones de seguridad).

**_api/users/:id (DELETE)_:** Permite al usuario dar de baja su cuenta. Se requiere ser el propietario de la cuenta a eliminar en cuestión.

######Deportes

**_api/sports/new (POST)_:** Permite al usuario registrar un nuevo deporte. Este no va vinculado de forma directa a ningún establecimiento, ya que los deportes 
poseen muchos establecimientos y viceversa. Se establece una relación N:M entre ellos. Se requiere una cuenta con un nivel de propietario.

**_api/sports/ (GET)_:** Recopila la información de todos los deportes.

**_api/sports/:id (GET)_:** Recopila la información del deporte especificado mediante su id.

**_api/sports/:id/establishments (GET)_:** Recopila la información de todos los establecimientos que imparten el deporte especificado mendiante la id.

**_api/sports/:id (PUT)_:** Actualiza la información del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

**_api/sports/:id (Delete)_:** Permite la eliminación del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

######Establecimientos

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

######Cursos

**_api/courses/new (POST)_:** Permite al usuario establecer un curso. Un curso está directamente relacionado con un establecimiento y un deporte. Por lo tanto
es obligatorio establecer la id del establecimiento en el cual se quiere impartir dicho curso, y el deporte del cual será el curso. 

**_api/courses/:id (GET)_:** Recopila información del curso especificado mediante su id. También recopila la información del tipo de deporte que es el curso,
y del establecimiento en el que se da dicho curso.

**_api/courses/:id (PUT)_:** Actualiza la información de un curso especificado mediante su id.

**_api/courses/:id (Delete)_:** Permite la eliminación de un curso especificado mediante su id.



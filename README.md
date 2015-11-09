#JustSport 

JustSport es un API Rest dise�ada para facilitar la difusi�n de los gimnasios, centros deportivos, y cualquier centro de dicho de �mbito.
Con ella podr�s anunciarte y facilitar a los usuarios, toda la informaci�n relativa a las clases y actividades deportivas que ofertas. 

#Gu�a para desarrolladores 

A continuaci�n, se proporcionar� una peque�a gu�a para los desarrolladores y cualquier persona que quiera hacer uso de ella. 

##Endpoints 

######Usuarios

**_api/users/new (POST)_:** Permite al usuario registrarse. Por defecto los usuarios ser�n del tipo "usuario". Pero este valor se puede establecer tambi�n a
"owner" para conseguir los privilegios que este rol otorga. El campo que establece el nivel de privilegios es "role". 

**_api/users/:id (GET)_:** Recopila la informaci�n del usuario mediante su id (excepto la contrase�a, la cual se mantiene en secreto por razones de seguridad).

**_api/users/:id (DELETE)_:** Permite al usuario dar de baja su cuenta. Se requiere ser el propietario de la cuenta a eliminar en cuesti�n.

######Deportes

**_api/sports/new (POST)_:** Permite al usuario registrar un nuevo deporte. Este no va vinculado de forma directa a ning�n establecimiento, ya que los deportes 
poseen muchos establecimientos y viceversa. Se establece una relaci�n N:M entre ellos. Se requiere una cuenta con un nivel de propietario.

**_api/sports/ (GET)_:** Recopila la informaci�n de todos los deportes.

**_api/sports/:id (GET)_:** Recopila la informaci�n del deporte especificado mediante su id.

**_api/sports/:id/establishments (GET)_:** Recopila la informaci�n de todos los establecimientos que imparten el deporte especificado mendiante la id.

**_api/sports/:id (PUT)_:** Actualiza la informaci�n del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

**_api/sports/:id (Delete)_:** Permite la eliminaci�n del deporte especificado mediante su id. Se requiere una cuenta con un nivel de propietario.

######Establecimientos

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

######Cursos

**_api/courses/new (POST)_:** Permite al usuario establecer un curso. Un curso est� directamente relacionado con un establecimiento y un deporte. Por lo tanto
es obligatorio establecer la id del establecimiento en el cual se quiere impartir dicho curso, y el deporte del cual ser� el curso. 

**_api/courses/:id (GET)_:** Recopila informaci�n del curso especificado mediante su id. Tambi�n recopila la informaci�n del tipo de deporte que es el curso,
y del establecimiento en el que se da dicho curso.

**_api/courses/:id (PUT)_:** Actualiza la informaci�n de un curso especificado mediante su id.

**_api/courses/:id (Delete)_:** Permite la eliminaci�n de un curso especificado mediante su id.



const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'pictogramm',
    api_key: '863583389655876',
    api_secret: 'AW7PNwzxeQCJzfslWkMjfdKssE0',
    secure: true
})

module.exports={
    MONGOURI:"mongodb+srv://aleena:y9ppUt3JfRKRZVhV@cluster0.zeq4q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    JWT_SECRET:"hkirietrierutioytkehfka",
    Mailgun_API_Key:"f8364b82ffe28be3c2caac3bf2fcabda-0be3b63b-14c59292",
    JWT_ACC_Activate:"accounactivationkeykjhcjksd"
}

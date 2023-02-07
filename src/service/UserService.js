import axios from "axios";

const BASE_URL="http://localhost:8080/user";
const MONGO_URL="https://licenta-production.up.railway.app"


class UserService {

        saveUser(user) {
            return axios.post(MONGO_URL+"/register/teacher",user);
        }
}

export default new UserService();


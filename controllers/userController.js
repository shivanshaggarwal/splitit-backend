import { UserModel } from "../models/userModel.js";
import redisClient from "../config/redis.js";


export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


export const searchUsers = async(req,res) =>{
  try {
    let {query,context} = req.query;
    console.log(query);
    console.log(context);
    if(!query){
      return res.json([]);
    }else{
      query = query.toLowerCase();
    }
    console.log(21);

    const key = "users:autocomplete";
    const prefix = `[${query}`;
    const nextPrefix = `[${query.slice(0,-1)}${String.fromCharCode(query.charCodeAt(query.length-1)+1)}`;
    console.log(30);
    const redisResults = await redisClient.zRangeByLex(key,prefix,nextPrefix, {
      LIMIT: {offset:0, count:10},
    });
    console.log(key);
    console.log(prefix);
    console.log(nextPrefix);
    if(redisResults.length>0){
      const users = redisResults.map((u)=>{
        const [name, email, id] = u.split('|');
        return {_id:id, name, email}
      })
      console.log(38);
      return res.json(users);
    }

    const currentUser = await UserModel.findById(req.user.id);
    const friendIds = currentUser.friends.map((f)=>f._id);
    console.log(48);
    if(context && context === 'group'){
      const users = await UserModel.find({
        $and:[
          {
            $or:[
              {name: {$regex:query, $options: "i"}},
              {email: {$regex:query, $options: "i"}},
            ]
          },
          {_id: {$ne:req.user.id}}
        ]
      }).select('name email').limit(10);

      users.forEach((u)=>{
        redisClient.zAdd(key, [{score:0, value: `${u.name.toLowerCase()}|${u.email.toLowerCase()}|${u._id}`}]);
      })
    }else{
      console.log(66);
      const users = await UserModel.find({
        $and:[
          {
            $or:[
              {name: {$regex:query, $options: "i"}},
              {email: {$regex:query, $options: "i"}},
            ]
          },
          {_id: {$ne:req.user.id}},
          {_id: {$nin: friendIds}}
        ]
      }).select('name email').limit(10);

      users.forEach((u)=>{
        redisClient.zAdd(key, [{score:0, value: `${u.name.toLowerCase()}|${u.email.toLowerCase()}|${u._id}`}]);
      })
    }

    console.log(61);
    res.json(users);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
}

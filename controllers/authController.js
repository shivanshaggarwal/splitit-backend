import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const register = async (req,res,next)=>{
    const {name,email,password} = req.body;

    try{
        const existing = await UserModel.findOne({email});
        console.log('existing',existing)
        if(existing){
            return res.status(400).json({msg:'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password,salt);
        const user = await UserModel.create({name,email,passwordHash});
        console.log('user',user);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({token,user:{id:user._id, name:user.name, email:user.email}})
    }catch(err){
        return res.status(500).json({msg:'Server error'});
    }
}


export const login = async (req,res,next)=>{
    const {email,password} = req.body;
    try{
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(400).json({msg:'Invalid credentials'});
        }
        const isMatch = await bcrypt.compare(password,user.passwordHash)
        if(!isMatch){
            return res.status(400).json({msg:'Invalid credentials'});
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        return res.status(200).json({token,user:{id:user._id, name:user.name, email:user.email}})
    }catch(err){
        return res.status(500).json({msg:'Server error'});
    }
}
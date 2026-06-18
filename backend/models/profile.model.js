import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
    school:{
        type:String,
        default:'',
    },
    degree:{
        type:String,
        default:'',
    },
    fieldOfStudy:{
        type:String,
        default:'',

    },
});


const workSchema = new mongoose.Schema({
    company:{
        type:String,
        default:'',

    },
    position:{
        type:String,
        default:'',

    },
    years:{
        type:String,
        default:'',
    },
});


const growthSchema = new mongoose.Schema({
    title:{
        type:String,
        default:'',
    },
    description:{
        type:String,
        default:'',
    },
    year:{
        type:String,
        default:'',
    },
});

const ProfileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    bio:{
        type:String,
        default:'',
    },
    currentPost:{
        type:String,
        default:''
    },
    postwork:{
        type:[workSchema],
        default:[]
    },
    education:{
        type:[educationSchema],
        default:[]
    },
    interests:{
        type:[String],
        default:[]
    },
    skills:{
        type:[String],
        default:[]
    },
    coverPicture:{
        type:String,
        default:'',
    },
    dateOfBirth:{
        type:String,
        default:'',
    },
    growthJourney:{
        type:[growthSchema],
        default:[]
    },
    headline:{
        type:String,
        default:'',
    },

});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;

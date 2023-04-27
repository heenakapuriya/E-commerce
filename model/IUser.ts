export interface IUser {
     _id?:string,
     name: string;
     email: string;
     phone: string;
     password:string;
     imageUrl:string;
     isAdmin:boolean;
     isSuperAdmin:boolean;
     createdAt?:Date;
     updatedAt?:Date;
   }
  
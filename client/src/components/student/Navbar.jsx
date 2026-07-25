import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {

  const { navigate, isEducator, backendUrl, setIsEducator, getToken } = useContext(AppContext);
  const isCourseListPage = location.pathname.includes("/course-list");

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const becomeEducator = async()=>{
    try{
      if(isEducator){
        navigate('/educator')
        return;
      }
      const token= await getToken()
      const {data} = await axios.get(backendUrl+'/api/educator/update-role',{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      if (data.success){
        setIsEducator(true)
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }

    }catch(error){
      toast.error(error.message)
    }

  }
  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-slate-300/70 py-3.5 bg-slate-100/90 backdrop-blur-lg shadow-xs transition-all duration-300"
    >
      <img
        onClick={() => {
          navigate('/')
          scrollTo(0, 0)
        }}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer hover:opacity-90 transition-opacity"
      />

      <div className="hidden md:flex items-center gap-6 text-slate-600 font-medium text-sm">
        <div className="flex items-center gap-4">
          {user && (
            <>
              <button 
                onClick={becomeEducator}
                className="hover:text-blue-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100/70"
              >
                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
              </button>
              <span className="text-slate-300">|</span>
              <Link 
                to="/my-enrollments"
                className="hover:text-blue-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100/70"
              >
                My Enrollments
              </Link>
            </>
          )}
        </div>
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <UserButton />
          </div>
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center gap-3 text-slate-600">
        <div className="flex items-center gap-2 text-xs font-medium">
          {user && (
            <>
              <button onClick={becomeEducator} className="hover:text-blue-600">
                {isEducator ? 'Educator' : 'Teach'}
              </button>
              <span className="text-slate-300">|</span>
              <Link to="/my-enrollments" className="hover:text-blue-600">
                Enrollments
              </Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button 
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white p-2 rounded-full shadow-sm"
          >
            <img src={assets.user_icon} alt="user" className="w-4 h-4 invert" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

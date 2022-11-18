import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sanityClient from "./client.js";
import "./myCss.css";
import {ethers} from "ethers";
import { Button, notification } from "antd";
import { Address, Balance, Events } from "./components";




export default function AllPosts({fuck}) {
  const [allPostsData, setAllPosts] = useState(null);
  const [isConnected, connected] = useState(false);
  const [show, setShow] = useState(true);
  const [name, setName] = useState("");
  const [change, setChange] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const [isAuth, setAuth] = useState(false);

if (fuck) {
  setAuth(true);
}

  function changeButton() {
    setChange(!change);
  }
  const sendNotification = (type, data) => {
    return notification[type]({
      ...data,
      placement: "bottomRight",
    });
  };

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "post"]{
            title,
            slug,
            "name": author->name,
            mainImage{
              asset->{
                _id,
                url
              }
            }
          }`
      )
      .then((data) => setAllPosts(data))
      .catch(console.error);
  }, []);

  console.log(allPostsData);


  return (
    <div className="min-h-screen p-12">
      <div className="container mx-auto">



        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPostsData &&
            allPostsData.map((post, index) => (
      
                <span
                  className="block h-64 relative rounded shadow leading-snug bg-black border-l-8 " style={{borderColor: "#313131"}}
                  key={index}
                >
                  <img
                    className="w-full h-full rounded-r object-cover absolute"
                    src={post.mainImage.asset.url}
                    alt=""
                  />
                  <span className="block relative h-full flex justify-start items-start pr-4 pb-4">

                    <h2 className=" text-lg font-bold px-3 py-3 text-red-100 flag">
                      {post.title}
                    </h2>

                    <h6 className=" font-bold px-3 py-3 text-red-100 flag" style={{ position: "absolute", right: "0", bottom: "0"}}>
                     <span> Author:</span> <span> {post.name}</span>
                    </h6>

                    <span>


                   
                    {isAuth && (
                      <Link to={"/" + post.slug.current} key={post.slug.current}>
                        <Button className="view-btn" type="primary" danger style={{position: "absolute", left: "10px", bottom: "10px"}}>view</Button>
                      </Link>
                    )}
                    </span>

                  </span>
                </span>
            ))}

        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import sanityClient from "./client.js";
import BlockContent from "@sanity/block-content-to-react";
import imageUrlBuilder from "@sanity/image-url";


const builder = imageUrlBuilder(sanityClient);
function urlFor(source) {
  return builder.image(source);
}

export default function OnePost() {
  const [postData, setPostData] = useState(null);
  const { slug } = useParams();
  const [headline, setHeadline] = useState(null);

  useEffect(() => {
    sanityClient
      .fetch(
        `*[slug.current == "${slug}"]{
            title,
            slug,
            mainImage{
              asset->{
                _id,
                url
              }
            },
            body,
            "name": author->name,
            "authorImage": author->image,
            "editor": editor->name,
            "editorImage": editor->image,
            "graphics": graphics->name,
            "graphicsImage": graphics-> image
          }`
      )
      .then((data) => setPostData(data[0]))
      .catch(console.error);
  }, [slug]);

  if (!postData) return <div>Loading...</div>;




const getHeadline = postData.title;
const parseHeadline = JSON.stringify(getHeadline);


console.log(parseHeadline)



  return (
    <div className="background min-h-screen p-12">
      <div className="container shadow-lg mx-auto rounded-lg" style={{backgroundColor: "#f5f5f5"}}>
        <div className="relative">
          <div className="absolute h-full w-full flex items-center justify-left p-2">
            {/* Title Section */}
            <div className="creds" style={{  position: "absolute", top: "10px", left: "10px", backgroundColor: "#000", opacity: "80%"}}>
              <div className="flex justify-left text-white pl-5 pr-5 pt-2">
                <img
                  src={urlFor(postData.authorImage).url()}
                  className="w-10 h-10 rounded-full"
                  alt="Author"
                />
                <h4 className=" flex items-left  pl-2 credText">
                  Author:
                </h4>
                <h4 className=" flex items-left  pl-1 credText">
                  {postData.name}
                </h4>

              </div>

              <div className="flex justify-left text-white pl-5 pr-5 pt-2">
              <img
                  src={urlFor(postData.editorImage).url()}
                  className="w-10 h-10 rounded-full"
                  alt="Editor"
                />
                <h4 className=" flex items-left  pl-2 credText">
                  Editor:
                </h4>
                <h4 className=" flex items-left  pl-1 credText">
                  {postData.editor}
                </h4>
            </div>

            <div className="flex justify-left text-white pl-5 pr-5 pt-2 pb-2">
              <img
                  src={urlFor(postData.graphicsImage).url()}
                  className="w-10 h-10 rounded-full"
                  alt="Designer"
                />
                <h4 className=" flex items-left  pl-2 credText">
                  Designer:
                </h4>
                <h4 className=" flex items-left  pl-1 credText">
                  {postData.graphics}
                </h4>
            </div>
            </div>
          </div>

        </div>
        <div className="px-16 lg:px-48 py-12 lg:py-20 prose lg:prose-xl max-w-full" style={{textAlign: "justify"}}>
          <BlockContent
            blocks={postData.body}
            projectId={sanityClient.clientConfig.projectId}
            dataset={sanityClient.clientConfig.dataset}
          />
        </div>
      </div>
    </div>
  );
}

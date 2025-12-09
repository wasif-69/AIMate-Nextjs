"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";
import { useAuth } from "../../Firebase/AuthContext";
import "./AllCommunity.css";
import { useRouter } from "next/navigation";

export default function AllCommunity() {
  const Router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [filterTag, setFilterTag] = useState(null); // selected tag/category filter
  const [uniqueTags, setUniqueTags] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      const ref = collection(db, "Community");
      const snapshot = await getDocs(ref);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setCommunities(list);

      // extract unique tags
      const tagsSet = new Set();
      list.forEach((c) => {
        const data = c.data || {};
        const tags = data.tags;
        if (Array.isArray(tags)) {
          tags.forEach((t) => tagsSet.add(t));
        }
      });
      setUniqueTags(Array.from(tagsSet));
    };

    fetchCommunities();
  }, []);

  const handleDelete = async (communityId) => {
    // maybe confirm
    if (window.confirm("Are you sure you want to delete this community?")) {
      await deleteDoc(doc(db, "Community", communityId));
      setCommunities((prev) => prev.filter((c) => c.id !== communityId));
    }
  };

  const filteredCommunities = filterTag
    ? communities.filter((c) => {
        const tags = c.data?.tags;
        return Array.isArray(tags) && tags.includes(filterTag);
      })
    : communities;

  const myCommunities = user
    ? filteredCommunities.filter((c) => c.UserID === user.uid)
    : [];

  return (
    <div className="community-container">
      <h1 className="title">🌐 The Social Network Center!</h1>
      <p className="subtitle">
        Discover communities near you in Islamabad — clubs, organizations,
        Olympiads, and MUNs made easier to join!
      </p>

      {!authLoading && !user && (
        <button className="add-btn" onClick={() => Router.push("/login")}>
          ➕ Login to add community
        </button>
      )}
      {user && (
        <button className="add-btn" onClick={() => Router.push("/allcommunity/add")}>
          ➕ Add Your Community
        </button>
      )}

      {/* Tag/Category filter UI */}
      <div className="tags-filter">
        <span>Filter by tag:</span>
        <button
          className={`tag-btn ${filterTag === null ? "active" : ""}`}
          onClick={() => setFilterTag(null)}
        >
          All
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${filterTag === tag ? "active" : ""}`}
            onClick={() => setFilterTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="community-list">
        <h2>
          {filterTag ? `Communities tagged "${filterTag}"` : "All Communities"}
        </h2>

        {filteredCommunities.length === 0 ? (
          <p className="empty">No communities found.</p>
        ) : (
          <ul className="community-cards">
            {filteredCommunities.map((c) => {
              const { id, Link, UserID, data = {} } = c;
              const { Name, tags, ...otherFields } = data;

              return (
                <li key={id} className="community-card">
                  <h3>{Name || "Unnamed Community"}</h3>

                  <div className="tags-container">
                    {Array.isArray(tags) &&
                      tags.map((t) => (
                        <span key={t} className="tag-chip">
                          {t}
                        </span>
                      ))}
                  </div>

                  <div className="community-details">
                    {Object.entries(otherFields).map(([key, value]) => {
                      if (!value) return null;

                      const isURL =
                        typeof value === "string" && value.startsWith("http");
                      const isInstagram = key
                        .toLowerCase()
                        .includes("instagram");

                      return (
                        <p key={key}>
                          <strong>{key}:</strong>{" "}
                          {isURL ? (
                            <a href={value as string} {...linkProps}>
                              {value}
                            </a>
                          ) : isInstagram ? (
                            <a
                              href={`https://instagram.com/${(
                                value as string
                              ).replace("@", "")}`}
                              {...linkProps}
                            >
                              @{(value as string).replace("@", "")}
                            </a>
                          ) : typeof value === "string" ||
                            typeof value === "number" ? (
                            value
                          ) : null}
                        </p>
                      );
                    })}
                  </div>

                  {Link && (
                    <a
                      className="visit-btn"
                      href={Link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Community
                    </a>
                  )}

                  {/* Edit / Delete for owners */}
                  {user && user.uid === UserID && (
                    <div className="owner-actions">
                      {/* <button
                        className="edit-btn"
                        onClick={() => navigate(`/community/edit/${id}`)}
                      >
                        Edit
                      </button> */}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";
import { useAuth } from "../../Firebase/AuthContext";
import { useRouter } from "next/navigation";
import "./AllCommunity.css";

interface CommunityData {
  Name?: string;
  tags?: string[];
  [key: string]: any; // any other fields
}

interface Community {
  id: string;
  UserID?: string;
  Link?: string;
  data: CommunityData; // data always exists,
  
}

interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  [key: string]: any;
}

export default function AllCommunity() {
  
  const Router = useRouter();
  const { user, loading: authLoading } = useAuth() as { 
  user: AuthUser | null; 
  loading: boolean; 
};

  const [communities, setCommunities] = useState<Community[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      const ref = collection(db, "Community");
      const snapshot = await getDocs(ref);

      const list: Community[] = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data() as DocumentData;

        return {
          id: docSnap.id,
          UserID: docData.UserID,
          Link: docData.Link,
          data: docData.data || docData, // Firestore might store fields directly
        };
      });

      setCommunities(list);

      // Extract unique tags
      const tagsSet = new Set<string>();
      list.forEach((c) => {
        const tags = c.data.tags;
        if (Array.isArray(tags)) {
          tags.forEach((t) => tagsSet.add(t));
        }
      });
      setUniqueTags(Array.from(tagsSet));
    };

    fetchCommunities();
  }, []);

  const handleDelete = async (communityId: string) => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      await deleteDoc(doc(db, "Community", communityId));
      setCommunities((prev) => prev.filter((c) => c.id !== communityId));
    }
  };

  const filteredCommunities = filterTag
    ? communities.filter((c) => Array.isArray(c.data.tags) && c.data.tags.includes(filterTag))
    : communities;

  return (
    <div className="community-container">
      <h1 className="title">🌐 The Social Network Center!</h1>
      <p className="subtitle">
        Discover communities near you in Islamabad — clubs, organizations, Olympiads, and MUNs made easier to join!
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
        <button className={`tag-btn ${filterTag === null ? "active" : ""}`} onClick={() => setFilterTag(null)}>
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
        <h2>{filterTag ? `Communities tagged "${filterTag}"` : "All Communities"}</h2>

        {filteredCommunities.length === 0 ? (
          <p className="empty">No communities found.</p>
        ) : (
          <ul className="community-cards">
            {filteredCommunities.map((c) => {
              const { id, Link, UserID, data } = c;
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

                      const isURL = typeof value === "string" && value.startsWith("http");
                      const isInstagram = key.toLowerCase().includes("instagram");

                      return (
                        <p key={key}>
                          <strong>{key}:</strong>{" "}
                          {isURL ? (
                            <a href={value as string} target="_blank" rel="noopener noreferrer">
                              {value}
                            </a>
                          ) : isInstagram ? (
                            <a href={`https://instagram.com/${(value as string).replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                              @{(value as string).replace("@", "")}
                            </a>
                          ) : typeof value === "string" || typeof value === "number" ? (
                            value
                          ) : null}
                        </p>
                      );
                    })}
                  </div>

                  {Link && (
                    <a className="visit-btn" href={Link} target="_blank" rel="noopener noreferrer">
                      Visit Community
                    </a>
                  )}

                  {/* Edit / Delete for owners */}
                  {user && user.uid === UserID && (
                    <div className="owner-actions">
                      <button className="delete-btn" onClick={() => handleDelete(id)}>
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

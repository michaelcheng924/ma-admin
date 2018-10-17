import React, { Component } from "react";
import Route from "react-router-dom/Route";
import axios from "axios";
import { find, isArray } from "lodash";

import { getStructuredPosts } from "./utils/posts";
import Login from "./components/Login";
import Home from "./components/Home";
import DBManagement from "./components/DBManagement";
import PostDetail from "./components/PostDetail";

import "./App.css";

class App extends Component {
  state = {
    backup: "",
    passages: [],
    posts: [],
    staging: [],
    structuredPosts: {},
    structuredStaging: {},
    token: null
  };

  componentDidMount() {
    const token = localStorage.getItem("ma-admin-token");

    if (token) {
      axios
        .post("/api/admin/checktoken", { token }, this.getHeaders())
        .then(response => {
          if (response.data.success) {
            this.setState({ token }, () => {
              this.getPosts();
            });
          }
        });
    }
  }

  getHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        "Content-Type": "application/json"
      }
    };
  };

  getPosts = () => {
    return axios.get("/api/admin/getdb", this.getHeaders()).then(response => {
      const { backup, categoriesWithOrder, posts, staging } = response.data;

      const structuredPosts = getStructuredPosts(posts);
      const structuredStaging = getStructuredPosts(staging);

      this.setState({
        backup,
        categoriesWithOrder,
        posts,
        staging,
        structuredPosts,
        structuredStaging
      });
    });
  };

  onLoginSuccess = token => {
    localStorage.setItem("ma-admin-token", token);

    this.setState({ token }, () => {
      this.getPosts();
    });
  };

  onCommit(post, postCategoriesWithOrder, history, url, callback) {
    const confirm = window.confirm("Are you sure?");

    if (confirm) {
      if (post.post) {
        delete post.post;
      }

      axios
        .post(
          url,
          {
            post,
            postCategoriesWithOrder
          },
          this.getHeaders()
        )
        .then(response => {
          if (response.data.success) {
            window.alert("Update successful!");
            callback(history, post);
          }
        });
    }
  }

  afterUpdate = () => {
    this.getPosts();
  };

  afterCreate = (history, post) => {
    this.getPosts().then(() => {
      history.push(`/postdetail?url=${post.url}`);
    });
  };

  onCommitUpdate = (post, postCategoriesWithOrder, history, url) => {
    this.onCommit(
      post,
      postCategoriesWithOrder,
      history,
      url,
      this.afterUpdate
    );
  };

  onCommitCreate = (post, postCategoriesWithOrder, history, url) => {
    this.onCommit(
      post,
      postCategoriesWithOrder,
      history,
      url,
      this.afterCreate
    );
  };

  renderLogin() {
    return (
      <div>
        <Login onLoginSuccess={this.onLoginSuccess} />
      </div>
    );
  }

  renderHome = () => {
    const { staging, structuredStaging } = this.state;

    return (
      <Home
        getHeaders={this.getHeaders}
        posts={staging}
        structuredPosts={structuredStaging}
      />
    );
  };

  renderDBManagement = () => {
    if (!this.state.token) {
      return null;
    }

    const { backup, posts, staging } = this.state;

    return (
      <DBManagement
        backup={backup}
        getHeaders={this.getHeaders}
        posts={posts}
        staging={staging}
      />
    );
  };

  renderPostDetail = ({ location }) => {
    const { categoriesWithOrder, staging, structuredStaging } = this.state;

    if (!staging.length) {
      return "Loading...";
    }

    const searchUrl = location.search.split("url=")[1];

    const post =
      find(staging, postData => {
        return postData.url === searchUrl;
      }) || {};

    const modifiedPost = {
      ...post,
      category: isArray(post.category) ? post.category : [post.category]
    };

    const postCategoriesWithOrder = modifiedPost.category.map(categoryData => {
      return find(categoriesWithOrder, categoryWithOrder => {
        return categoryWithOrder.url === categoryData.url;
      });
    });

    return (
      <PostDetail
        categoriesWithOrder={categoriesWithOrder}
        commitPost={this.onCommitUpdate}
        post={modifiedPost}
        postCategoriesWithOrder={postCategoriesWithOrder}
        posts={staging}
        structuredPosts={structuredStaging}
      />
    );
  };

  renderNewPost = ({ history }) => {
    const { categoriesWithOrder, staging, structuredStaging } = this.state;

    const rootData = structuredStaging[Object.keys(structuredStaging)[0]];

    const post = {
      id: "",
      title: "",
      subtitle: "",
      imageUrl: "",
      url: "",
      added: "",
      updated: "",
      tags: [],
      content: "",
      references: [],
      root: {
        url: rootData.url,
        heading: rootData.heading
      },
      category: []
    };

    return (
      <PostDetail
        categoriesWithOrder={categoriesWithOrder}
        commitPost={this.onCommitCreate}
        history={history}
        post={post}
        posts={staging}
        postCategoriesWithOrder={[]}
        structuredPosts={structuredStaging}
      />
    );
  };

  render() {
    return this.state.posts.length ? (
      <div className="App">
        <Route exact path="/" render={this.renderHome} />
        <Route path="/dbmanagement" render={this.renderDBManagement} />
        <Route path="/postdetail" render={this.renderPostDetail} />
        <Route path="/newpost" render={this.renderNewPost} />
      </div>
    ) : (
      this.renderLogin()
    );
  }
}

export default App;

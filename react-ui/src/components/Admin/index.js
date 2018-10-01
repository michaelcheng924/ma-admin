import "./styles.css";
import React, { Component } from "react";
import axios from "axios";

import { ReadingContainer } from "../../Writing";
import Login from "./Login";
import PostsManager from "./PostsManager";

class App extends Component {
  state = {
    loggedIn: false,
    root: "apologetics",
    token: ""
  };

  onLoginSuccess = token => {
    this.setState({ loggedIn: true, token });
  };

  onSitemapSubmit = event => {
    event.preventDefault();

    axios
      .post(
        "/api/admin/sitemap",
        {
          sitemap: this.sitemap.value
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.state.token}`
          }
        }
      )
      .then(() => {
        this.sitemap.value = "";
      });
  };

  onSetRoot = root => {
    this.setState({ root });
  };

  renderLogin() {
    return (
      <div>
        <Login onLoginSuccess={this.onLoginSuccess} />
      </div>
    );
  }

  renderSaveSitemap() {
    return (
      <form onSubmit={this.onSitemapSubmit}>
        <h2>Upload Sitemap</h2>
        <textarea ref={sitemap => (this.sitemap = sitemap)} />
        <button>Submit</button>
      </form>
    );
  }

  renderPostsManager() {
    return (
      <div>
        <h2>Posts Manager</h2>
        <div className="admin__categories">
          <div onClick={() => this.setState({ root: "apologetics" })}>
            Apologetics
          </div>
          <div onClick={() => this.setState({ root: "theology" })}>
            Theology
          </div>
        </div>
        <PostsManager
          onSetRoot={this.onSetRoot}
          root={this.state.root}
          structuredPosts={this.props.structuredPosts}
        />
      </div>
    );
  }

  render() {
    return (
      <ReadingContainer>
        {this.state.loggedIn ? (
          <div>
            {this.renderSaveSitemap()}
            {this.renderPostsManager()}
          </div>
        ) : (
          this.renderLogin()
        )}
      </ReadingContainer>
    );
  }
}

export default App;

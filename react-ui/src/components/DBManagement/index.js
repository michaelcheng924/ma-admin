import "./styles.css";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import ListItem from "../ListItem";

export default class DBManagement extends Component {
  backUpDatabase = () => {
    axios.post("/api/admin/backup", {}, this.props.getHeaders()).then(() => {
      window.alert("Posts backed up!");
    });
  };

  resetPosts = () => {
    const confirm = window.confirm("Are you sure?");

    if (confirm) {
      axios
        .post("/api/admin/resetposts", {}, this.props.getHeaders())
        .then(() => {
          window.alert("Reset posts!");
        });
    }
  };

  migrate = () => {
    const confirm = window.confirm("Are you sure?");

    if (confirm) {
      axios.post("/api/admin/migrate", {}, this.props.getHeaders()).then(() => {
        window.alert("Migrated!");
      });
    }
  };

  resetStaging = () => {
    const confirm = window.confirm("Are you sure?");

    if (confirm) {
      axios
        .post("/api/admin/resetstaging", {}, this.props.getHeaders())
        .then(() => {
          window.alert("Reset staging!");
        });
    }
  };

  renderDBData() {
    const { backup, posts, staging } = this.props;

    return (
      <div>
        <hr />
        <div className="db__compare">
          <div className="db__compare-posts">
            <div>{posts.length}</div>
            {posts.map(post => {
              return <ListItem key={post.url} {...post} />;
            })}
          </div>
          <div className="db__compare-posts">
            <div>{staging.length}</div>
            {staging.map(post => {
              return <ListItem key={post.url} {...post} />;
            })}
          </div>
        </div>
        <hr />
        <div>Backup length: {backup.length}</div>
        <div>{JSON.stringify(backup)}</div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Link to="/">Home</Link>
        <div>
          <button onClick={this.backUpDatabase}>Back up database</button>
        </div>
        <div>
          <button onClick={this.resetPosts}>Reset posts</button>
        </div>
        <div>
          <button onClick={this.resetStaging}>Reset staging</button>
        </div>
        <div>
          <button onClick={this.migrate}>Migrate</button>
        </div>
        {this.renderDBData()}
      </div>
    );
  }
}

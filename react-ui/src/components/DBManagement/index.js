import "./styles.css";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Textarea from "react-textarea-autosize";

import ListItem from "../ListItem";

export default class DBManagement extends Component {
  state = {
    sitemap: ""
  };

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

  onSubmitSitemap = () => {
    axios
      .post(
        "/api/admin/sitemap",
        {
          sitemap: this.state.sitemap
        },
        this.props.getHeaders()
      )
      .then(() => {
        this.setState({ sitemap: "" });
      });
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
        <Textarea
          placeholder="Sitemap"
          value={this.state.sitemap}
          onChange={event => this.setState({ sitemap: event.target.value })}
          style={{ width: "100%" }}
        />
        <div>
          <button onClick={this.onSubmitSitemap}>Submit Sitemap</button>
        </div>
        {this.renderDBData()}
      </div>
    );
  }
}

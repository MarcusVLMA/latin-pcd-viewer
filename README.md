# latin-pcd-viewer

This project is a fork from [https://github.com/MarcusVLMA/latin-pcd-viewer](https://github.com/MarcusVLMA/latin-pcd-viewer) and was developed during my undergraduate thesis.

Simple web PCD files Viewer made with Three JS.

## Dependencies

- [bindings](https://www.npmjs.com/package/bindings)
- [express](https://www.npmjs.com/package/express)
- [formidable](https://www.npmjs.com/package/formidable)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [browserify](https://www.npmjs.com/package/browserify)
- [three](https://www.npmjs.com/package/three)

To install all dependencies, enter the following command on root folder:

```
npm run install
```

### Observations: 

- This application have `fiducial_point_finder.node`, `point_explorer.node` and `pipeline.node` dependencies. You need to build them from your computer and put them inside the modules folder.

- Because of this dependency, **this web application is currently limited to version 10 of Node.js**.

- You need [Point Cloud Library](https://pointclouds.org/) and its dependencies installed for the modules listed above to work.

Check the [Landmark Analysis](https://github.com/thalissonfelipe/landmarks-analysis) e [Point Explorer](https://github.com/thalissonfelipe/point-explorer) repositories for more information about these modules and how to build them.

## Run

To run the application, enter the following command on root folder:

```
npm run dev
```

The server will be listening on `http://localhost:3000`.

const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");

// CRUD
router.post("/", userCtrl.createUser);
router.get("/", userCtrl.getAllUsers);
router.get("/:id", userCtrl.getUserById);
router.put("/:id", userCtrl.updateUser);
router.delete("/:id", userCtrl.softDeleteUser);

// enable/disable (theo yêu cầu đề)
router.post("/enable", userCtrl.enableUser);
router.post("/disable", userCtrl.disableUser);

module.exports = router;
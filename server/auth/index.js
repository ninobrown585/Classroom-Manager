const router = require("express").Router();
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const prisma = new PrismaClient();
const JWT = process.env.JWT;


// Register a new instructor account
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.instructor.create({
      data: {
        username,
        password: hashedPassword,
      }
    })

    // Create a token with the instructor id
    const token = jwt.sign({ id: user.id }, JWT);

    res.status(201).send({ token });
  } catch (error) {
    next(error);
  }
});

// Login to an existing instructor account
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.instructor.findUnique({where: {username}});

    if (!user) {
      return res.status(401).send("Invalid login credentials.");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid){
      return res.status(401).send("Invalid login credentials.")
    }

    // Create a token with the instructor id
    const token = jwt.sign({ id: user.id }, JWT);

    res.send({ token });
  } catch (error) {
    next(error);
  }
});

// Get the currently logged in instructor
router.get("/me", async (req, res, next) => {
  try {
    // const { id } = req.body;
    console.log(req.user)
    // const user = await prisma.instructor.findUnique({where: {id}});
    // const {
    //   rows: [instructor],
    // } = await db.query("SELECT * FROM instructor WHERE id = $1", [
    //   req.user?.id,
    // ]);

    res.send(req.user);
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;

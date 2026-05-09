import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "HelpDeskPro API",
    status: "healthy",
  });
});

export default router;
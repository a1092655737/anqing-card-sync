// PlanetScale 兼容的数据库连接
// 使用标准 mysql2 驱动连接 PlanetScale 公共端点

import mysql from "mysql2/promise";
import { env } from "../lib/env";

let pool: mysql.Pool | null = null;

export function getPlanetScalePool(): mysql.Pool {
  if (!pool) {
    // 支持两种 URL 格式：
    // 1. PlanetScale: mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}
    // 2. TiDB: mysql://user:pass@host:4000/db
    
    const databaseUrl = env.databaseUrl;
    
    // 解析 URL
    const url = new URL(databaseUrl);
    const isPlanetScale = url.hostname.includes("planetscale") || url.searchParams.has("ssl");
    
    pool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || (isPlanetScale ? 3306 : 4000),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1).split("?")[0],
      ssl: isPlanetScale ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 15000,
    });
    
    console.log(`[DB] Connected to ${isPlanetScale ? "PlanetScale" : "TiDB"} at ${url.hostname}`);
  }
  return pool;
}

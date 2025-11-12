"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const lamp_module_1 = require("./lamp/lamp.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(lamp_module_1.LampModule);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    common_1.Logger.log(`💡 Lamp service running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map
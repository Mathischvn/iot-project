import { MotionService } from './motion.service';
import { MotionState } from './motion.dto';
export declare class MotionController {
    private readonly motionService;
    constructor(motionService: MotionService);
    info(): {
        name: string;
        type: string;
        status: string;
    };
    getProperties(): MotionState;
    detect(): MotionState;
    clear(): MotionState;
    toggle(): MotionState;
    reset(): MotionState;
}

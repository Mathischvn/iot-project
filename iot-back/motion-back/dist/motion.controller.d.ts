import { MotionService } from './motion.service';
import { UpdateArmedDto, UpdateSensitivityDto, TriggerDto } from './motion.dto';
export declare class MotionController {
    private readonly motionService;
    constructor(motionService: MotionService);
    getDescription(): {
        '@context': string;
        id: string;
        title: string;
        description: string;
        properties: {
            detected: {
                type: string;
                readOnly: boolean;
            };
            armed: {
                type: string;
            };
            sensitivity: {
                type: string;
                minimum: number;
                maximum: number;
                unit: string;
            };
        };
        actions: {
            setArmed: {
                input: {
                    type: string;
                };
            };
            setSensitivity: {
                input: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
            };
            trigger: {
                input: {
                    type: string;
                };
            };
            reset: {
                description: string;
            };
        };
    };
    getAllProperties(): import("./motion.dto").MotionState;
    getDetected(): {
        detected: boolean;
    };
    getArmed(): {
        armed: boolean;
    };
    getSensitivity(): {
        sensitivity: number;
    };
    setArmed(dto: UpdateArmedDto): import("./motion.dto").MotionState;
    setSensitivity(dto: UpdateSensitivityDto): import("./motion.dto").MotionState;
    trigger(dto: TriggerDto): import("./motion.dto").MotionState;
    reset(): import("./motion.dto").MotionState;
}

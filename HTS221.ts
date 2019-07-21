/**
 * ST HTS221 Humidity and temperature Sensor I2C extension for makecode.
 * From microbit/micropython Chinese community.
 * https://github.com/makecode-extensions
 */

/**
 * ST HTS221 Humidity and temperature Sensor I2C extension
 */
//% weight=100 color=#70c0f0 icon="\uf2c9" block="HTS221" 
namespace HTS221 {
    export enum HTS221_T_UNIT {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    export enum POWER_ONOFF {
        //% block="ON"
        ON = 1,
        //% block="OFF"
        OFF = 0
    }

    const HTS221_I2C_Addr = 0x5F
    let _oneshot = false
    let T0_OUT = 0
    let T1_OUT = 0
    let T0_degC = 0
    let T1_degC = 0
    let H0_OUT = 0
    let H1_OUT = 0
    let H0_rH = 0
    let H1_rH = 0
    let KT = 0
    let KH = 0

    init()

    // set dat to reg
    function setreg(reg: number, dat: number): void {
        let tb = pins.createBuffer(2)
        tb[0] = reg
        tb[1] = dat
        pins.i2cWriteBuffer(HTS221_I2C_Addr, tb)
    }

    // read a Int8LE from reg
    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(HTS221_I2C_Addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(HTS221_I2C_Addr, NumberFormat.Int8LE);
    }

    // read a UInt8LE from reg
    function getUInt8LE(reg: number): number {
        pins.i2cWriteNumber(HTS221_I2C_Addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(HTS221_I2C_Addr, NumberFormat.UInt8LE);
    }

    // read a Int16LE from reg
    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(HTS221_I2C_Addr, reg | 0x80, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(HTS221_I2C_Addr, NumberFormat.Int16LE);
    }

    // read a UInt16LE from reg
    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(HTS221_I2C_Addr, reg | 0x80, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(HTS221_I2C_Addr, NumberFormat.UInt16LE);
    }

    // set a mask dat to reg
    function setreg_mask(reg: number, dat: number, mask: number): void {
        setreg(reg, (getUInt8LE(reg) & mask) | dat)
    }

    // limit decimal digits
    function bitround(x: number, b: number = 1): number {
        let n = 10 ** b
        return Math.round(x * n) / n
    }

    /**
     * Init sensor
     */
    //% block="Initialize"
    export function init() {
        // HTS221 Temp Calibration registers
        T0_OUT = getInt16LE(0x3C)
        T1_OUT = getInt16LE(0x3E)
        let t = getUInt8LE(0x35) % 16
        T0_degC = getUInt8LE(0x32) / 8 + (t % 4) * 32
        T1_degC = getUInt8LE(0x33) / 8 + (t / 4) * 32
        // HTS221 Humi Calibration registers
        H0_OUT = getInt16LE(0x36)
        H1_OUT = getInt16LE(0x3A)
        H0_rH = getUInt8LE(0x30) / 2
        H1_rH = getUInt8LE(0x31) / 2
        // Coefficient
        KT = (T1_degC - T0_degC) / (T1_OUT - T0_OUT)
        KH = (H1_rH - H0_rH) / (H1_OUT - H0_OUT)
        // set av conf: T = 32 H= 256
        setreg(0x10, 0x26)
        // set CTRL_REG1: PD = 1 BDU= 1 ODR= 1
        setreg(0x20, 0x85)
        oneshot_mode(false)
    }

    // oneshot mode handle
    function ONE_SHOT(b: number): void {
        if (_oneshot) {
            setreg(0x21, getUInt8LE(0x21) | 0x01) // start oneshot
            getUInt8LE(0x2D - b * 2) // clear flag
            while (true) {
                if (getUInt8LE(0x27) & b)
                    return
            }
        }
    }

    /**
     * set oneshot mode to reduce power consumption
     */
    //% block="oneshot mode %oneshot"
    export function oneshot_mode(oneshot: boolean = false) {
        let t = (oneshot) ? 0 : 1
        setreg_mask(0x20, t, 0xFC)
    }

    /**
     * get humidity from HTS221
     */
    //% block="humidity"
    export function humidity(): number {
        ONE_SHOT(2)
        return bitround(H0_rH + (getInt16LE(0x28) - H0_OUT) * KH)
    }

    /**
     * get temperature from HTS221
     */
    //% block="temperature %u"
    export function temperature(u: HTS221.HTS221_T_UNIT = HTS221.HTS221_T_UNIT.C): number {
        ONE_SHOT(1)
        let T = T0_degC + (getInt16LE(0x2A) - T0_OUT) * KT
        if (u) T = 32 + T * 9 / 5
        return bitround(T)
    }

    /**
     * set power on/off
     */
    //% block="power %on"
    export function power(on: HTS221.POWER_ONOFF = HTS221.POWER_ONOFF.ON) {
        let t = (on) ? 0x80 : 0
        setreg_mask(0x20, t, 0x7F)
    }
}

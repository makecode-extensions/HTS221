basic.forever(function () {
    serial.writeValue("T", HTS221.temperature(HTS221.HTS221_T_UNIT.C))
    serial.writeValue("H", HTS221.humidity())
    basic.pause(1000)
})
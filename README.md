# HTS221 package

ST HTS221 Humidity and temperature Sensor I2C extension for makecode.  

Author: shaoziyang  
Date:   2019.Jul  

## Basic usage
```
basic.forever(function () {
    serial.writeValue("T", HTS221.temperature(HTS221.HTS221_T_UNIT.C))
    serial.writeValue("H", HTS221.humidity())
    basic.pause(1000)
})
```

## License

MIT

Copyright (c) 2018, microbit/micropython Chinese community  

## Supported targets

* for PXT/microbit


[From microbit/micropython Chinese community](http://www.micropython.org.cn)

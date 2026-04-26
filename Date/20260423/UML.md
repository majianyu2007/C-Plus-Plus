# CHippogriff UML

```mermaid
classDiagram
    class CAnimal {
        #char name[32]
        #int age
        #int weight
        +CAnimal(char* strName = "", int a = 0, int w = 0)
        +~CAnimal()
        +Show() const
    }

    class CLion {
        #int m_mane
        +CLion(char* strName = "", int a = 0, int w = 0, int mane = 0)
        +~CLion()
        +Show() const
        +Talk() const
    }

    class CHorse {
        #int m_power
        +CHorse(int pow = 0, char* strName = "", int a = 0, int w = 0)
        +~CHorse()
        +Show() const
        +Run() const
        +Talk() const
    }

    class CBird {
        #int m_wingspan
        +CBird(int ws = 0, char* strName = "", int a = 0, int w = 0)
        +~CBird()
        +Show() const
        +Fly() const
        +Talk() const
    }

    class CHippogriff {
        #int AP
        +CHippogriff(char* strName = "", int a = 0, int w = 0, int ws = 0, int power = 0, int mane = 0, int ap = 500)
        +~CHippogriff()
        +Talk() const
        +Show() const
    }

    CLion ..|> CAnimal : virtual
    CHorse ..|> CAnimal : virtual
    CBird ..|> CAnimal : virtual

    CHippogriff --|> CLion
    CHippogriff --|> CHorse
    CHippogriff --|> CBird
```

说明：
- 通过虚继承，CHippogriff 仅保留一份 CAnimal 子对象，避免重复构造和二义性。
- CHippogriff::Show() 按 Bird -> Horse -> Lion 顺序聚合展示，再输出 Attack Power。
- CHippogriff::Talk() 直接复用 CLion::Talk()，根据有无鬃毛区分雄狮/雌狮行为。

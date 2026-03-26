/*
1.  设计一个名为IntQueue的队列类，用于存储整数。队列以“先进先出”的方式存取元素。这个类包含：  
(1) 名为element的数据成员，保存队列中的int值; element的类型可以使用vector或在堆上分配的动态数组。  
(2) 名为size的数据成员，保存队列中元素的个数。  
(3) 默认构造函数，用默认的队列容量值初始化IntQueue对象。  
(4) 进队列操作void enqueue(int value)，将value加入队列尾，一旦元素个数超过了队列容量，将队列容量翻倍。  
(5) 出队列操作出int dequeue()，删除队列首元素并将其返回；原来的第二个元素变成新的队列首元素，依次类推。  
(6) 判断队列是否为空的操作bool empty()，如果队列为空，返回true。  
(7) 成员函数size_t getSize()，返回队列中元素的个数。  
(8) 根据(1)中选择的数据结构，设计需要的拷贝控制成员。  
编写测试程序，利用IntQueue将输入的整数加入队列，然后逐一移出队列井输出。例如：队列中假设有元素3、2、8、6；执行enqueue(5)后队列变为3、2、8、6、5；执行dequeue()后返回3，队列变为2、8、6、5。
*/
#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

class IntQueue
{
private:
    vector<int> element;  // 存储队列元素的容器
    size_t front;         // 队列首元素的索引
    size_t rear;          // 队列中下一个可插入位置的索引
    size_t capacity;      // 当前队列的容量

public:
    // 默认构造函数：初始化队列
    IntQueue(size_t initialCapacity = 10) 
        : front(0), rear(0), capacity(initialCapacity)
    {
        element.resize(capacity);  // 为vector分配初始空间
    }

    // 判断队列是否为空
    bool empty() const
    {
        return front == rear;  // 首尾指针相同说明队列为空
    }

    // 获取队列中当前元素个数
    size_t getSize() const
    {
        return rear - front;  // 尾指针 - 首指针 = 元素个数
    }

    // 进队列：将value加入队列尾部
    void enqueue(int value)
    {
        // 检查是否需要整理队列空间
        if (rear >= capacity)
        {
            // 如果前面有已删除的空间，先将有效元素前移
            if (front > 0)
            {
                // 将从front到rear的元素移到0开始的位置
                for (size_t i = 0; i < getSize(); i++)
                {
                    element[i] = element[front + i];
                }
                rear = getSize();  // 更新rear指针
                front = 0;         // front重置为0
            }
        }

        // 如果仍然空间不足，容量翻倍
        if (rear >= capacity)
        {
            capacity *= 2;
            element.resize(capacity);
        }

        // 将value放入rear位置
        element[rear] = value;
        rear++;  // rear向后移动
    }

    // 出队列：删除首元素并返回其值
    int dequeue()
    {
        if (empty())
        {
            throw std::runtime_error("队列为空，无法出队！");
        }

        // 返回首元素的值
        int value = element[front];
        front++;  // front向后移动，相当于删除了首元素
        return value;
    }

    // 拷贝构造函数：用一个现存的队列初始化新队列
    IntQueue(const IntQueue& other) 
        : front(other.front), rear(other.rear), 
          capacity(other.capacity), element(other.element)
    {
    }

    // 赋值运算符重载：将一个队列赋值给另一个队列
    IntQueue& operator=(const IntQueue& other)
    {
        if (this != &other)
        {
            front = other.front;
            rear = other.rear;
            capacity = other.capacity;
            element = other.element;
        }
        return *this;
    }

    // 析构函数：清理资源（vector会自动释放内存）
    ~IntQueue()
    {
    }
};

// ==================== 测试程序 ====================
int main()
{
    IntQueue queue;
    int value;

    // 输入阶段：将整数逐个加入队列
    cout << "请输入整数加入队列（输入-1结束）：" << endl;
    while (cin >> value && value != -1)
    {
        queue.enqueue(value);
        cout << "✓ 元素 " << value << " 已加入队列。当前队列大小：" 
             << queue.getSize() << endl;
    }

    // 输出阶段：从队列中逐个移出元素
    cout << "\n从队列中逐一移出元素（先进先出）：" << endl;
    while (!queue.empty())
    {
        cout << queue.dequeue() << " ";
    }
    cout << "\n\n队列已清空。" << endl;

    return 0;
}